import { NextRequest, NextResponse } from 'next/server';
import BlogPost from '@/models/BlogPost';
import connectToDB from '@/lib/db';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '@/lib/cloudinary';

/**
 * Get blog posts
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = includeUnpublished ? {} : { isPublished: true };

    // Get total count and blog posts in parallel
    const [total, blogPosts] = await Promise.all([
      BlogPost.countDocuments(query),
      BlogPost.find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title slug excerpt featuredImage tags isPublished viewCount likesCount commentsCount createdAt updatedAt publishedAt')
        .lean()
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        posts: blogPosts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

/**
 * Create new blog post
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      featuredImage, 
      featuredImageFile, 
      tags,
      isPublished,
      isFeatured
    } = body;

    if (!title || !slug || !content || !excerpt) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    let finalFeaturedImage = featuredImage;
    if (featuredImageFile && !featuredImage) {
      try {
        const uploadResult = await uploadToCloudinary(featuredImageFile, 'blog');
        finalFeaturedImage = uploadResult.url;
      } catch (uploadError) {
        return NextResponse.json(
          { success: false, error: 'Lỗi khi upload ảnh đại diện' },
          { status: 400 }
        );
      }
    }

    if (!finalFeaturedImage) {
      return NextResponse.json(
        { success: false, error: 'Ảnh đại diện là bắt buộc' },
        { status: 400 }
      );
    }

    const existingPost = await BlogPost.findOne({ slug });
    if (existingPost) {
      return NextResponse.json(
        { success: false, error: 'Slug đã tồn tại' },
        { status: 400 }
      );
    }

    const newBlogPost = new BlogPost({
      title,
      slug,
      content,
      excerpt,
      featuredImage: finalFeaturedImage,
      tags: tags || [],
      isPublished: isPublished || false,
      isFeatured: isFeatured || false,
      publishedAt: isPublished ? new Date() : undefined
    });

    const savedPost = await newBlogPost.save();

    return NextResponse.json({
      success: true,
      data: savedPost,
      message: 'Tạo bài viết thành công'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}
