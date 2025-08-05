import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Comment from '@/models/Comment';
import Product from '@/models/Product';

// POST - Thêm comment mới
export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    
    const { slug, userId, userName, comment } = await request.json();
    
    // Validate dữ liệu đầu vào
    if (!slug || !userId || !userName || !comment) {
      return NextResponse.json(
        { error: 'Slug, userId, userName và comment là bắt buộc' },
        { status: 400 }
      );
    }
    
    if (comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment không được để trống' },
        { status: 400 }
      );
    }
    
    if (comment.length > 1000) {
      return NextResponse.json(
        { error: 'Comment không được vượt quá 1000 ký tự' },
        { status: 400 }
      );
    }
    
    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findOne({ slug });
    if (!product) {
      return NextResponse.json(
        { error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }
    
    // Tạo comment mới
    const newComment = new Comment({
      slug,
      userId,
      userName,
      comment: comment.trim()
    });
    
    await newComment.save();
    
    return NextResponse.json({
      message: 'Thêm comment thành công',
      comment: newComment
    }, { status: 201 });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

// GET - Lấy danh sách comment của sản phẩm
export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt'; 
    const sortOrder = searchParams.get('sortOrder') || 'desc'; 
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug là bắt buộc' },
        { status: 400 }
      );
    }
    
    // Tính toán offset
    const skip = (page - 1) * limit;
    
    // Tạo sort object
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Lấy comments với phân trang
    const comments = await Comment.find({ slug })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Đếm tổng số comments
    const totalComments = await Comment.countDocuments({ slug });
    const totalPages = Math.ceil(totalComments / limit);
    
    return NextResponse.json({
      comments,
      pagination: {
        currentPage: page,
        totalPages,
        totalComments,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật comment (chỉ user sở hữu comment mới được cập nhật)
export async function PUT(request: NextRequest) {
  try {
    await connectToDB();
    
    const { commentId, userId, comment } = await request.json();
    
    // Validate dữ liệu đầu vào
    if (!commentId || !userId || !comment) {
      return NextResponse.json(
        { error: 'CommentId, userId và comment là bắt buộc' },
        { status: 400 }
      );
    }
    
    if (comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment không được để trống' },
        { status: 400 }
      );
    }
    
    if (comment.length > 1000) {
      return NextResponse.json(
        { error: 'Comment không được vượt quá 1000 ký tự' },
        { status: 400 }
      );
    }
    
    // Tìm và cập nhật comment (chỉ user sở hữu mới được cập nhật)
    const updatedComment = await Comment.findOneAndUpdate(
      { _id: commentId, userId },
      { comment: comment.trim() },
      { new: true }
    );
    
    if (!updatedComment) {
      return NextResponse.json(
        { error: 'Không tìm thấy comment hoặc bạn không có quyền cập nhật' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Cập nhật comment thành công',
      comment: updatedComment
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa comment (chỉ user sở hữu comment mới được xóa)
export async function DELETE(request: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');
    const userId = searchParams.get('userId');
    
    if (!commentId || !userId) {
      return NextResponse.json(
        { error: 'CommentId và userId là bắt buộc' },
        { status: 400 }
      );
    }
    
    // Tìm comment trước khi xóa để lấy productId
    const comment = await Comment.findOne({ _id: commentId, userId });
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Không tìm thấy comment hoặc bạn không có quyền xóa' },
        { status: 404 }
      );
    }
    
    // Xóa comment
    await Comment.findByIdAndDelete(commentId);
    
    return NextResponse.json({ message: 'Xóa comment thành công' });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}
