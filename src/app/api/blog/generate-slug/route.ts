import { NextRequest, NextResponse } from 'next/server';
import BlogPost from '@/models/BlogPost';
import connectToDB from '@/lib/db';

/**
 * Generate unique slug from title
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const body = await request.json();
    const { title, excludeSlug } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title là bắt buộc' },
        { status: 400 }
      );
    }

    // Convert title to slug
    let baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    // Check if slug exists (excluding current post if editing)
    while (true) {
      const query: any = { slug };
      if (excludeSlug) {
        query.slug = { $ne: excludeSlug };
      }

      const existingPost = await BlogPost.findOne(query);
      
      if (!existingPost) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return NextResponse.json({
      success: true,
      data: { slug }
    });

  } catch (error) {
    console.error('Error generating slug:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}
