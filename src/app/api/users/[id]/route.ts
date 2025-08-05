import { NextRequest, NextResponse } from "next/server";
import connectToDB from '@/lib/db';
import User from '@/models/User';

// GET /api/users/[id] - Lấy user theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    
    const { id } = await params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user",
      },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Cập nhật user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    
    const { id } = await params;
    const body = await request.json();

    // Remove sensitive fields that shouldn't be updated via this endpoint
    const { password, ...updateData } = body;

    // Kiểm tra user hiện tại trước khi cập nhật
    const currentUser = await User.findById(id);
    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Ngăn không cho ban tài khoản admin
    if (currentUser.roles === 'admin' && updateData.isActive === false) {
      return NextResponse.json(
        {
          success: false,
          error: "Không thể vô hiệu hóa tài khoản quản trị viên",
        },
        { status: 403 }
      );
    }

    // Ngăn không cho thay đổi role của admin khác
    if (currentUser.roles === 'admin' && updateData.roles && updateData.roles !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: "Không thể thay đổi quyền của tài khoản quản trị viên",
        },
        { status: 403 }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Xóa user (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    
    const { id } = await params;

    // Kiểm tra user trước khi xóa
    const currentUser = await User.findById(id);
    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Ngăn không cho xóa tài khoản admin
    if (currentUser.roles === 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: "Không thể xóa tài khoản quản trị viên",
        },
        { status: 403 }
      );
    }

    // Soft delete - set isActive to false instead of actual deletion
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
      },
      { status: 500 }
    );
  }
}
