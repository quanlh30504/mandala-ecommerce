import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

// GET /api/products/[id] - Lấy chi tiết sản phẩm theo ID hoặc slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const { id } = await params;
    let filter: any;

    if (ObjectId.isValid(id) && id.length === 24) {

      filter = {
        _id: new ObjectId(id),
        isActive: true
      };
    } else {
      filter = {
        slug: id,
        isActive: true
      };
    }
    const product = await db.collection('products').findOne(filter);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found'
        },
        { status: 404 }
      );
    }

    const productId = product._id;
    await db.collection('products').updateOne(
      { _id: productId },
      { $inc: { viewCount: 1 } }
    );

    const relatedProducts = await db.collection('products')
      .find({
        _id: { $ne: product._id },
        categoryIds: { $in: Array.isArray(product.categoryIds) ? product.categoryIds : [] },
        isActive: true
      })
      .limit(4)
      .toArray();

    return NextResponse.json({
      success: true,
      data: {
        product: {
          ...product,
          viewCount: (product.viewCount || 0) + 1
        },
        relatedProducts
      }
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product'
      },
      { status: 500 }
    );
  }
}
