import { NextRequest, NextResponse } from "next/server";
import connectToDB from '@/lib/db';
import Category from '@/models/Category';

// GET /api/categories/[id] - Lấy category theo ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDB();

        const { id } = await params;

        const category = await Category.findById(id);

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Category not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error("Error fetching category:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch category",
            },
            { status: 500 }
        );
    }
}

// PUT /api/categories/[id] - Cập nhật category
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDB();

        const { id } = await params;
        const body = await request.json();

        const category = await Category.findByIdAndUpdate(
            id,
            { ...body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Category not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: category,
            message: "Category updated successfully",
        });
    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to update category",
            },
            { status: 500 }
        );
    }
}

// DELETE /api/categories/[id] - Xóa category
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDB();

        const { id } = await params;

        // Kiểm tra xem có category con không
        const hasChildren = await Category.findOne({ parentId: id });
        if (hasChildren) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Cannot delete category with subcategories",
                },
                { status: 400 }
            );
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Category not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to delete category",
            },
            { status: 500 }
        );
    }
}

