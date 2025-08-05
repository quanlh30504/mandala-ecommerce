import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

// GET /api/admin/products/[id] - Lấy chi tiết sản phẩm cho admin (bao gồm inactive)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid product ID'
        },
        { status: 400 }
      );
    }

    const product = await db.collection('products').findOne({
      _id: new ObjectId(id)
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error fetching admin product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product'
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - Cập nhật sản phẩm
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const { id } = await params;
    const body = await request.json();
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid product ID'
        },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await db.collection('products').findOne({
      _id: new ObjectId(id)
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found'
        },
        { status: 404 }
      );
    }

    // Prepare update object
    const updateData: any = {
      updatedAt: new Date()
    };

    // Only update provided fields
    const allowedFields = [
      'name', 'description', 'shortDescription', 'price', 'salePrice',
      'sku', 'stock', 'images', 'categoryIds', 'tags', 'attributes',
      'isActive', 'isFeatured', 'isHotTrend', 'discountPercentage'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'price' || field === 'salePrice' || field === 'stock' || field === 'discountPercentage') {
          updateData[field] = parseInt(body[field]) || 0;
        } else if (field === 'categoryIds' && !Array.isArray(body[field])) {
          updateData[field] = [body[field]];
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Generate new slug if name changed
    if (body.name && body.name !== existingProduct.name) {
      const slug = body.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      // Check if new slug already exists (excluding current product)
      const existingSlug = await db.collection('products').findOne({ 
        slug, 
        _id: { $ne: new ObjectId(id) } 
      });
      
      if (existingSlug) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Product with this name (slug) already exists' 
          },
          { status: 400 }
        );
      }
      
      updateData.slug = slug;
    }

    // Check SKU uniqueness if changed
    if (body.sku && body.sku !== existingProduct.sku) {
      const existingSku = await db.collection('products').findOne({ 
        sku: body.sku,
        _id: { $ne: new ObjectId(id) }
      });
      
      if (existingSku) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Product with this SKU already exists' 
          },
          { status: 400 }
        );
      }
    }

    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found'
        },
        { status: 404 }
      );
    }

    // Fetch updated product
    const updatedProduct = await db.collection('products').findOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json({
      success: true,
      data: updatedProduct
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update product'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Xóa sản phẩm
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid product ID'
        },
        { status: 400 }
      );
    }

    const result = await db.collection('products').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete product'
      },
      { status: 500 }
    );
  }
}
