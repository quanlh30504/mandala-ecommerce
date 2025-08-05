import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, UPLOAD_CONFIGS } from '@/lib/cloudinary';

/**
 * POST /api/upload?type=blog|product|payment
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as keyof typeof UPLOAD_CONFIGS;

    if (!type || !UPLOAD_CONFIGS[type]) {
      return NextResponse.json(
        { success: false, error: 'Loại upload không hợp lệ. Sử dụng: blog, product, hoặc payment' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    const fileName = formData.get('fileName') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Không có file được tải lên' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File phải là định dạng ảnh' },
        { status: 400 }
      );
    }

    const sizeLimits = {
      blog: 5 * 1024 * 1024,    
      product: 3 * 1024 * 1024,  
      payment: 1 * 1024 * 1024  
    };

    if (file.size > sizeLimits[type]) {
      const limitMB = sizeLimits[type] / (1024 * 1024);
      return NextResponse.json(
        { success: false, error: `File không được vượt quá ${limitMB}MB` },
        { status: 400 }
      );
    }

    const result = await uploadToCloudinary(file, type, fileName);

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        fileName: fileName || file.name,
        type: type
      },
      message: `Upload ảnh ${type} thành công`
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server khi upload ảnh' },
      { status: 500 }
    );
  }
}
