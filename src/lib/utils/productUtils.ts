// Utility functions for product management

/**
 * Get image URL - handles both Cloudinary and local images
 */
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '/placeholder.svg'
  
  // If it's a Cloudinary URL, return as is
  if (imagePath.startsWith('https://res.cloudinary.com')) {
    return imagePath
  }
  
  // Convert local path to public URL
  return imagePath.replace('/public/', '/')
}

/**
 * Format price to Vietnamese currency
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(price)
}

/**
 * Convert product attributes for form display
 */
export const convertAttributesForForm = (attributes: any) => {
  const converted: {
    brand?: string
    type?: string
    material?: string
    color?: string
    size?: string
    weight?: string
  } = {}

  if (attributes.brand) converted.brand = attributes.brand
  if (attributes.type) converted.type = attributes.type
  if (attributes.material) converted.material = attributes.material
  if (attributes.color) converted.color = attributes.color
  if (attributes.weight) converted.weight = attributes.weight
  
  // Handle size - convert object to string if needed
  if (attributes.size) {
    if (typeof attributes.size === 'string') {
      converted.size = attributes.size
    } else if (typeof attributes.size === 'object') {
      // Convert size object to string representation
      converted.size = Object.entries(attributes.size)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
    }
  }

  return converted
}

/**
 * Generate product slug from name
 */
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^\w\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // replace multiple hyphens with single
    .trim()
}

/**
 * Validate product form data
 */
export const validateProductForm = (formData: any): string | null => {
  if (!formData.name?.trim()) {
    return 'Vui lòng nhập tên sản phẩm'
  }
  
  if (!formData.price || parseInt(formData.price) <= 0) {
    return 'Vui lòng nhập giá sản phẩm hợp lệ'
  }
  
  if (!formData.sku?.trim()) {
    return 'Vui lòng nhập mã SKU'
  }
  
  if (!formData.categoryIds || formData.categoryIds.length === 0) {
    return 'Vui lòng chọn ít nhất một danh mục'
  }

  return null
}

/**
 * Upload images to Cloudinary
 */
export const uploadImagesToCloudinary = async (files: FileList): Promise<string[]> => {
  // Check if Cloudinary is configured
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  
  if (!cloudName || !uploadPreset || cloudName === 'your_cloud_name' || uploadPreset === 'your_upload_preset') {
    throw new Error('Cloudinary chưa được cấu hình. Vui lòng cấu hình NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME và NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET trong file .env')
  }
  
  if (!files || files.length === 0) {
    throw new Error('Không có file được chọn')
  }

  const uploadPromises = Array.from(files).map(async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)
    formData.append('folder', 'products') // Upload to products folder
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `Failed to upload image: ${response.status}`)
    }
    
    const result = await response.json()
    return result.secure_url
  })

  return Promise.all(uploadPromises)
}
