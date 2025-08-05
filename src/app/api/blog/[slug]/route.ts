import { NextRequest, NextResponse } from 'next/server';
import BlogPost from '@/models/BlogPost';
import connectToDB from '@/lib/db';
import { uploadToCloudinary } from '@/lib/cloudinary';

/**
 * Get blog post by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDB();
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    let blogPost;
    if (isAdmin) {
      blogPost = await BlogPost.findOne({ slug }).lean();
    } else {
      blogPost = await BlogPost.findOneAndUpdate(
        { slug, isPublished: true },
        { $inc: { viewCount: 1 } },
        { new: true }
      ).lean();
    }

    if (!blogPost) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bài viết' },
        { status: 404 }
      );
    }

    const singleBlogPost = Array.isArray(blogPost) ? blogPost[0] : blogPost;

    // For admin access, return just the post data
    if (isAdmin) {
      return NextResponse.json({
        success: true,
        data: {
          post: blogPost
        }
      });
    }

    // Get previous and next posts for navigation (public access only)
    const [previousPost, nextPost] = await Promise.all([
      BlogPost.findOne({
        isPublished: true,
        publishedAt: { $lt: singleBlogPost.publishedAt }
      })
      .sort({ publishedAt: -1 })
      .select('title slug')
      .lean(),
      
      BlogPost.findOne({
        isPublished: true,
        publishedAt: { $gt: singleBlogPost.publishedAt }
      })
      .sort({ publishedAt: 1 })
      .select('title slug')
      .lean()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        post: blogPost,
        navigation: {
          previous: previousPost,
          next: nextPost
        }
      }
    });

  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

/**
 * Update blog post by slug
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDB();

    const { slug } = await params;
    const body = await request.json();
    const {
      title,
      slug: newSlug,
      content,
      excerpt,
      featuredImage,
      featuredImageFile,
      tags,
      isPublished,
      isFeatured
    } = body;

    const existingPost = await BlogPost.findOne({ slug });
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bài viết' },
        { status: 404 }
      );
    }

    if (newSlug && newSlug !== slug) {
      const duplicateSlug = await BlogPost.findOne({ slug: newSlug });
      if (duplicateSlug) {
        return NextResponse.json(
          { success: false, error: 'Slug đã tồn tại' },
          { status: 400 }
        );
      }
    }

    let finalFeaturedImage = featuredImage;
    if (featuredImageFile) {
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

    const updateData: any = {};
    if (title) updateData.title = title;
    if (newSlug) updateData.slug = newSlug;
    if (content) updateData.content = content;
    if (excerpt) updateData.excerpt = excerpt;
    if (finalFeaturedImage) updateData.featuredImage = finalFeaturedImage;
    if (tags !== undefined) updateData.tags = tags;
    if (typeof isPublished === 'boolean') {
      updateData.isPublished = isPublished;
      if (isPublished && !existingPost.isPublished) {
        updateData.publishedAt = new Date();
      }
    }
    if (typeof isFeatured === 'boolean') updateData.isFeatured = isFeatured;

    const updatedPost = await BlogPost.findOneAndUpdate(
      { slug },
      updateData,
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({
      success: true,
      data: updatedPost,
      message: 'Cập nhật bài viết thành công'
    });

  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

/**
 * Delete blog post by slug
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDB();

    const { slug } = await params;

    const deletedPost = await BlogPost.findOneAndDelete({ slug });

    if (!deletedPost) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bài viết' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa bài viết thành công'
    });

  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}