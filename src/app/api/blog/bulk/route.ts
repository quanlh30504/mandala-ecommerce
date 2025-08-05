import { NextRequest, NextResponse } from 'next/server';
import BlogPost from '@/models/BlogPost';
import connectToDB from '@/lib/db';

/**
 * Bulk update blog posts
 */
export async function PATCH(request: NextRequest) {
  try {
    await connectToDB();

    const body = await request.json();
    const { slugs, action } = body;

    if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Danh sách slug không hợp lệ' },
        { status: 400 }
      );
    }

    let updateData: any = {};
    let message = '';

    switch (action) {
      case 'publish':
        updateData = { 
          isPublished: true,
          publishedAt: new Date()
        };
        message = `Đã xuất bản ${slugs.length} bài viết`;
        break;
      
      case 'unpublish':
        updateData = { isPublished: false };
        message = `Đã hủy xuất bản ${slugs.length} bài viết`;
        break;
      
      case 'feature':
        updateData = { isFeatured: true };
        message = `Đã đặt nổi bật ${slugs.length} bài viết`;
        break;
      
      case 'unfeature':
        updateData = { isFeatured: false };
        message = `Đã hủy nổi bật ${slugs.length} bài viết`;
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: 'Hành động không hợp lệ' },
          { status: 400 }
        );
    }

    const result = await BlogPost.updateMany(
      { slug: { $in: slugs } },
      updateData
    );

    return NextResponse.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      },
      message
    });

  } catch (error) {
    console.error('Error bulk updating blog posts:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

/**
 * Bulk delete blog posts
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectToDB();

    const body = await request.json();
    const { slugs } = body;

    if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Danh sách slug không hợp lệ' },
        { status: 400 }
      );
    }

    const result = await BlogPost.deleteMany({ slug: { $in: slugs } });

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: result.deletedCount
      },
      message: `Đã xóa ${result.deletedCount} bài viết`
    });

  } catch (error) {
    console.error('Error bulk deleting blog posts:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}
