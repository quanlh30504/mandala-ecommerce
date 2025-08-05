import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET /api/admin/products - Lấy tất cả sản phẩm cho admin (bao gồm cả inactive)
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // active, inactive, all
    
    // Tạo filter object
    const filter: any = {};
    
    if (category) {
      filter.categoryIds = { $in: [category] };
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Filter theo trạng thái cho admin
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }
    // Nếu status === 'all' hoặc không có, lấy tất cả
    
    // Tính toán skip cho pagination
    const skip = (page - 1) * limit;
    
    const products = await db.collection('products')
      .find(filter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await db.collection('products').countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products' 
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Tạo sản phẩm mới
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'price', 'sku', 'categoryIds'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }
    
    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .replace(/[^\w\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/-+/g, '-') // replace multiple hyphens with single
      .trim();
    
    // Check if slug already exists
    const existingSlug = await db.collection('products').findOne({ slug });
    if (existingSlug) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Product with this name (slug) already exists' 
        },
        { status: 400 }
      );
    }
    
    // Check if SKU already exists
    const existingSku = await db.collection('products').findOne({ sku: body.sku });
    if (existingSku) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Product with this SKU already exists' 
        },
        { status: 400 }
      );
    }
    
    // Generate productId - find the highest existing productId number
    const allProducts = await db.collection('products')
      .find({ productId: { $regex: /^prod-\d+$/ } }, { projection: { productId: 1 } })
      .toArray();
    
    let nextId = 1;
    if (allProducts.length > 0) {
      const existingIds = allProducts
        .map(p => parseInt(p.productId.replace('prod-', '')))
        .filter(id => !isNaN(id));
      
      if (existingIds.length > 0) {
        nextId = Math.max(...existingIds) + 1;
      }
    }
    
    let productId = `prod-${nextId}`;
    
    // Double check for uniqueness (in case of race condition)
    let attempts = 0;
    while (attempts < 10) {
      const existingProduct = await db.collection('products').findOne({ productId });
      if (!existingProduct) {
        break;
      }
      nextId++;
      productId = `prod-${nextId}`;
      attempts++;
    }
    
    if (attempts >= 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unable to generate unique product ID' 
        },
        { status: 500 }
      );
    }
    
    // Create product object
    const newProduct = {
      productId,
      slug,
      name: body.name,
      description: body.description || '',
      shortDescription: body.shortDescription || '',
      price: parseInt(body.price),
      salePrice: body.salePrice ? parseInt(body.salePrice) : null,
      sku: body.sku,
      stock: parseInt(body.stock || 0),
      images: body.images || [],
      categoryIds: Array.isArray(body.categoryIds) ? body.categoryIds : [body.categoryIds],
      tags: body.tags || [],
      attributes: body.attributes || {},
      rating: {
        average: 0,
        count: 0,
        details: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
      },
      isActive: body.isActive !== undefined ? body.isActive : true,
      isFeatured: body.isFeatured || false,
      isHotTrend: body.isHotTrend || false,
      viewCount: 0,
      discountPercentage: body.discountPercentage || 0,
      commentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('products').insertOne(newProduct);
    
    return NextResponse.json({
      success: true,
      data: {
        _id: result.insertedId,
        ...newProduct
      }
    });
    
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create product' 
      },
      { status: 500 }
    );
  }
}
