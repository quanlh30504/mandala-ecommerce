import { v2 as cloudinary } from 'cloudinary';

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const CLOUDINARY_FOLDERS = {
  BLOGS: 'mandala/blogs',
  PRODUCTS: 'mandala/products',
  PAYMENTS: 'mandala/payments',
} as const;

export const UPLOAD_CONFIGS = {
  blog: {
    folder: CLOUDINARY_FOLDERS.BLOGS,
    transformation: [
      { width: 1200, height: 630, crop: 'fill', quality: 'auto' },
      { format: 'webp' }
    ]
  },
  product: {
    folder: CLOUDINARY_FOLDERS.PRODUCTS,
    transformation: [
      { width: 800, height: 800, crop: 'fill', quality: 'auto' },
      { format: 'webp' }
    ]
  },
  payment: {
    folder: CLOUDINARY_FOLDERS.PAYMENTS,
    transformation: [
      { width: 400, height: 200, crop: 'fit', quality: 'auto' },
      { format: 'webp' }
    ]
  }
} as const;

type UploadType = keyof typeof UPLOAD_CONFIGS;


export const uploadToCloudinary = async (
  file: File | string,
  type: UploadType = 'blog',
  customFileName?: string
): Promise<{ url: string; publicId: string }> => {
  try {
    let uploadData: string;

    if (file instanceof File) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      uploadData = `data:${file.type};base64,${buffer.toString('base64')}`;
    } else {
      uploadData = file;
    }

    const config = UPLOAD_CONFIGS[type];
    const timestamp = Date.now();
    
    let fileName = customFileName;
    if (!fileName && file instanceof File) {
      fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
    }
    
    const publicId = fileName 
      ? `${fileName.split('.')[0]}-${timestamp}`
      : `${type}-${timestamp}`;

    const result = await cloudinary.uploader.upload(uploadData, {
      folder: config.folder,
      public_id: publicId,
      resource_type: 'image',
      transformation: config.transformation
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Lỗi khi upload ảnh');
  }
};


export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Lỗi khi xóa ảnh');
  }
};


export const extractPublicId = (url: string): string | null => {
  try {
    const regex = /\/v\d+\/(.+)\./;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
};

export default cloudinary;
