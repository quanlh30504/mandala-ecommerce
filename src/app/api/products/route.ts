import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

// GET /api/products - Unified endpoint với hỗ trợ cả pagination và advanced filtering
export async function GET(request: NextRequest) {
    try {
        await connectToDB();

        const { searchParams } = new URL(request.url);
        
        // Pagination parameters (tương thích với code MongoDB cũ)
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '0'); // 0 = no limit (tương thích với code Mongoose cũ)
        
        // Filter parameters (giữ nguyên logic từ code Mongoose)  
        const category = searchParams.get('category');
        const tags = searchParams.get('tags');
        const search = searchParams.get('search');
        const isFeatured = searchParams.get('featured');
        const isHotTrend = searchParams.get('hotTrend');

        let filter: any = {};

        // Xử lý category filter với logic phức tạp (giữ nguyên từ code cũ)
        if (category) {
            // Lọc tất cả category active
            const Category = (await import('@/models/Category')).default;
            const allCategories = await Category.find({ isActive: true });

            // So sánh các loại Id trong mongodb 
            const selectedCategory = allCategories.find(cat => 
                cat._id?.toString() === category || 
                cat.categoryId === category ||
                cat.id === category
            );

            if (selectedCategory) {
                let categoryIds = [category];

                // Nếu category có level = 1 , lấy toàn bộ bao gồm cả subcategory
                if (selectedCategory.level === 1) {
                    const subcategories = allCategories.filter(cat => 
                        cat.level === 2 && cat.parentId === selectedCategory.categoryId
                    );
                    
                    // Add subcategory IDs (use categoryId field)
                    const subcategoryIds = subcategories.map(subcat => subcat.categoryId).filter(Boolean);
                    
                    categoryIds = [selectedCategory.categoryId, ...subcategoryIds];
                } else {
                    // For level 2 categories, use the categoryId
                    categoryIds = [selectedCategory.categoryId];
                }

                // Tạo filter cho mongodb
                filter.categoryIds = { $in: categoryIds };
            } else {
                // trường hợp category không tồn tại
                console.log('Category not found in database:', category);
                filter.categoryIds = { $in: ['non-existent-category'] };
            }
        }

        // Xử lý tag filter (giữ nguyên logic)
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
            if (tagArray.length > 0) {
                filter.tags = { $in: tagArray };
                console.log('Filtering products with tags:', tagArray);
            }
        }

        // Xử lý search filter (giữ nguyên logic)
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Xử lý featured filter (giữ nguyên logic)
        if (isFeatured === 'true') {
            filter.isFeatured = true;
        }

        // Xử lý hotTrend filter (giữ nguyên logic)
        if (isHotTrend === 'true') {
            filter.isHotTrend = true;
        }

        // Tìm sản phẩm theo filter với pagination support
        let query = Product.find(filter).sort({ createdAt: -1 });
        
        // Nếu có pagination parameters, apply pagination
        if (limit > 0) {
            const skip = (page - 1) * limit;
            query = query.skip(skip).limit(limit);
            
            // Đếm tổng số documents cho pagination info
            const total = await Product.countDocuments(filter);
            const totalPages = Math.ceil(total / limit);
            
            const products = await query.exec();
            
            // Trả về format tương thích MongoDB client code cũ
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
        } else {
            // Không có pagination - trả về tất cả products (tương thích với Mongoose code cũ)
            const products = await query.exec();
            
            console.log(`Products API: Found ${products.length} products for category: ${category || 'all'}, tags: ${tags || 'none'}`);
            
            // Trả về array trực tiếp (tương thích với service layer hiện tại)
            return NextResponse.json(products);
        }

    } catch (err) {
        console.error('Failed to fetch products:', err);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
