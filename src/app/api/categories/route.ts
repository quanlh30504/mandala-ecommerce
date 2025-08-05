import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';

// GET /api/categories - Lấy danh sách categories với filter
export async function GET(request: NextRequest) {
    try {
        await connectToDB();

        const { searchParams } = new URL(request.url);
        const parentId = searchParams.get('parentId');
        const level = searchParams.get('level');
        const isActive = searchParams.get('isActive');
        const includeInactive = searchParams.get('includeInactive');

        // Xây dựng filter
        const filter: any = {};
        
        if (parentId !== null) {
            filter.parentId = parentId === 'null' ? null : parentId;
        }
        
        if (level) {
            filter.level = parseInt(level);
        }
        
        if (!includeInactive) {
            filter.isActive = isActive === 'false' ? false : true;
        } else if (isActive) {
            filter.isActive = isActive === 'true';
        }

        const categories = await Category.find(filter)
            .sort({ level: 1, sortOrder: 1 });

        return NextResponse.json({
            success: true,
            data: categories,
        });
    } catch (err) {
        console.error('Failed to fetch categories:', err);
        return NextResponse.json({ 
            success: false,
            error: 'Failed to fetch categories' 
        }, { status: 500 });
    }
}

// POST /api/categories - Tạo category mới
export async function POST(request: NextRequest) {
    try {
        await connectToDB();
        
        const body = await request.json();
        const { name, slug, description, parentId, level, sortOrder, isActive } = body;

        // Validate required fields
        if (!name || !slug) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Name and slug are required",
                },
                { status: 400 }
            );
        }

        // Kiểm tra slug trùng lặp
        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Slug already exists",
                },
                { status: 400 }
            );
        }

        // Tạo categoryId tự động
        const categoryCount = await Category.countDocuments();
        const categoryId = parentId ? `${parentId}-${categoryCount + 1}` : `cat-${categoryCount + 1}`;

        const newCategory = new Category({
            categoryId,
            name,
            slug,
            description: description || "",
            parentId: parentId || null,
            level: level || 1,
            sortOrder: sortOrder || 1,
            isActive: isActive !== undefined ? isActive : true,
        });

        const savedCategory = await newCategory.save();
        
        return NextResponse.json({
            success: true,
            data: savedCategory,
            message: "Category created successfully",
        }, { status: 201 });
    } catch (err) {
        console.error('Failed to create category:', err);
        return NextResponse.json({ 
            success: false,
            error: 'Failed to create category' 
        }, { status: 500 });
    }
}
