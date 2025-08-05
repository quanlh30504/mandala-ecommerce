import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Rating from '@/models/Rating';
import Product from '@/models/Product';

// POST - Thêm hoặc cập nhật rating
export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    
    const body = await request.json();    
    const { slug, userId, rating } = body;
    if (!slug || !userId || !rating) {
      return NextResponse.json(
        { error: 'Slug, userId và rating là bắt buộc' },
        { status: 400 }
      );
    }
    
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating phải từ 1 đến 5' },
        { status: 400 }
      );
    }
    
    const product = await Product.findOne({ slug }).select('_id');
    if (!product) {
      return NextResponse.json(
        { error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }
    
    let existingRating = await Rating.findOne({ slug, userId });
    
    if (existingRating) {
      const oldRating = existingRating.rating;
      existingRating.rating = rating;
      await existingRating.save();
      await updateProductRating(slug, oldRating, rating, false);
      
      return NextResponse.json({
        message: 'Cập nhật rating thành công',
        rating: existingRating
      });
    } else {      
      const newRating = new Rating({
        slug,
        userId,
        rating
      });
      
      await newRating.save();      
      await updateProductRating(slug, null, rating, true);
      
      return NextResponse.json({
        message: 'Thêm rating thành công',
        rating: newRating
      }, { status: 201 });
    }
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server nội bộ', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Lấy rating của user cho sản phẩm
export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const userId = searchParams.get('userId');
    
    if (!slug || !userId) {
      return NextResponse.json(
        { error: 'Slug và userId là bắt buộc' },
        { status: 400 }
      );
    }
    
    const rating = await Rating.findOne({ slug, userId });
    
    if (!rating) {
      return NextResponse.json(
        { message: 'Chưa có rating cho sản phẩm này' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ rating });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa rating
export async function DELETE(request: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const userId = searchParams.get('userId');
    
    if (!slug || !userId) {
      return NextResponse.json(
        { error: 'Slug và userId là bắt buộc' },
        { status: 400 }
      );
    }
    
    const rating = await Rating.findOneAndDelete({ slug, userId });
    
    if (!rating) {
      return NextResponse.json(
        { error: 'Không tìm thấy rating để xóa' },
        { status: 404 }
      );
    }
    
    await updateProductRating(slug, rating.rating, null, false, true);
    
    return NextResponse.json({ message: 'Xóa rating thành công' });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

// Hàm helper để cập nhật rating trong Product
async function updateProductRating(
  slug: string, 
  oldRating: number | null, 
  newRating: number | null, 
  isNew: boolean, 
  isDelete: boolean = false
) {
  const product = await Product.findOne({ slug }).select('rating');
  if (!product) return;
  
  const currentDetails = product.rating.details || new Map();
  
  if (isDelete && oldRating) {
    const oldCount = currentDetails.get(oldRating.toString()) || 0;
    if (oldCount > 0) {
      currentDetails.set(oldRating.toString(), oldCount - 1);
    }
    product.rating.count = Math.max(0, product.rating.count - 1);
  } else if (isNew && newRating) {
    const newCount = currentDetails.get(newRating.toString()) || 0;
    currentDetails.set(newRating.toString(), newCount + 1);
    product.rating.count = product.rating.count + 1;
  } else if (oldRating && newRating) {
    const oldCount = currentDetails.get(oldRating.toString()) || 0;
    const newCount = currentDetails.get(newRating.toString()) || 0;
    
    if (oldCount > 0) {
      currentDetails.set(oldRating.toString(), oldCount - 1);
    }
    currentDetails.set(newRating.toString(), newCount + 1);
  }
  
  let totalRating = 0;
  let totalCount = 0;
  
  for (let i = 1; i <= 5; i++) {
    const count = currentDetails.get(i.toString()) || 0;
    totalRating += i * count;
    totalCount += count;
  }
  
  product.rating.average = totalCount > 0 ? totalRating / totalCount : 0;
  product.rating.details = currentDetails;
  
  await Product.findOneAndUpdate(
    { slug },
    { 
      'rating.average': product.rating.average,
      'rating.details': product.rating.details,
      'rating.count': totalCount
    }
  );
}
