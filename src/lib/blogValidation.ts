export interface BlogPostValidationError {
  field: string;
  message: string;
}

export interface BlogPostValidationResult {
  isValid: boolean;
  errors: BlogPostValidationError[];
}

/**
 * Validate blog post data
 */
export function validateBlogPost(data: {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  tags?: string[];
}): BlogPostValidationResult {
  const errors: BlogPostValidationError[] = [];

  // Validate title
  if (!data.title || data.title.trim().length < 3) {
    errors.push({
      field: 'title',
      message: 'Tiêu đề phải có ít nhất 3 ký tự'
    });
  } else if (data.title.length > 200) {
    errors.push({
      field: 'title',
      message: 'Tiêu đề không được vượt quá 200 ký tự'
    });
  }

  // Validate slug
  if (!data.slug || data.slug.trim().length < 3) {
    errors.push({
      field: 'slug',
      message: 'Slug phải có ít nhất 3 ký tự'
    });
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push({
      field: 'slug',
      message: 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang'
    });
  }

  // Validate content
  if (!data.content || data.content.trim().length < 10) {
    errors.push({
      field: 'content',
      message: 'Nội dung phải có ít nhất 10 ký tự'
    });
  }

  // Validate excerpt
  if (!data.excerpt || data.excerpt.trim().length < 10) {
    errors.push({
      field: 'excerpt',
      message: 'Tóm tắt phải có ít nhất 10 ký tự'
    });
  } else if (data.excerpt.length > 500) {
    errors.push({
      field: 'excerpt',
      message: 'Tóm tắt không được vượt quá 500 ký tự'
    });
  }

  // Validate featured image
  if (!data.featuredImage || data.featuredImage.trim().length === 0) {
    errors.push({
      field: 'featuredImage',
      message: 'Ảnh đại diện là bắt buộc'
    });
  }

  // Validate tags
  if (data.tags && data.tags.length > 10) {
    errors.push({
      field: 'tags',
      message: 'Không được có quá 10 tags'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate excerpt from content if not provided
 */
export function generateExcerpt(content: string, maxLength: number = 300): string {
  if (!content) return '';
  
  // Remove HTML tags and extra whitespace
  const cleanContent = content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  // Find the last complete word within the limit
  const truncated = cleanContent.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.8) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
}

/**
 * Clean and format tags
 */
export function formatTags(tags: string[]): string[] {
  if (!Array.isArray(tags)) return [];
  
  return tags
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)
    .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
    .slice(0, 10); // Limit to 10 tags
}
