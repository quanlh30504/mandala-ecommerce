const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt: string;
  featuredImage: string;
  tags: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
  formattedDate?: string;
}

export interface BlogListResponse {
  success: boolean;
  data: {
    posts: BlogPost[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalPosts: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface BlogDetailResponse {
  success: boolean;
  data: {
    post: BlogPost;
    navigation: {
      previous: BlogPost | null;
      next: BlogPost | null;
    };
  };
}

export interface CreateBlogPostData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {}

export interface BulkActionData {
  slugs: string[];
  action: 'publish' | 'unpublish' | 'feature' | 'unfeature';
}

export class BlogService {
  /**
   * Get paginated list of blog posts
   */
  static async getBlogPosts(page: number = 1, limit: number = 6): Promise<BlogListResponse> {
    const url = `${API_BASE_URL}/api/blog?page=${page}&limit=${limit}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Lỗi khi tải danh sách bài viết');
    }
    
    return response.json();
  }

  /**
   * Get blog post detail by slug
   */
  static async getBlogPost(slug: string): Promise<BlogDetailResponse> {
    const url = `${API_BASE_URL}/api/blog/${slug}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Lỗi khi tải bài viết');
    }
    
    return response.json();
  }

  /**
   * Create new blog post
   */
  static async createBlogPost(data: CreateBlogPostData): Promise<{ success: boolean; data: BlogPost; message: string }> {
    const url = `${API_BASE_URL}/api/blog`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Lỗi khi tạo bài viết');
    }
    
    return response.json();
  }

  /**
   * Update blog post
   */
  static async updateBlogPost(slug: string, data: UpdateBlogPostData): Promise<{ success: boolean; data: BlogPost; message: string }> {
    const url = `${API_BASE_URL}/api/blog/${slug}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Lỗi khi cập nhật bài viết');
    }
    
    return response.json();
  }

  /**
   * Delete blog post
   */
  static async deleteBlogPost(slug: string): Promise<{ success: boolean; message: string }> {
    const url = `${API_BASE_URL}/api/blog/${slug}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Lỗi khi xóa bài viết');
    }
    
    return response.json();
  }

  /**
   * Bulk update blog posts
   */
  static async bulkUpdateBlogPosts(data: BulkActionData): Promise<{ success: boolean; message: string }> {
    const url = `${API_BASE_URL}/api/blog/bulk`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Lỗi khi cập nhật hàng loạt');
    }
    
    return response.json();
  }

  /**
   * Bulk delete blog posts
   */
  static async bulkDeleteBlogPosts(slugs: string[]): Promise<{ success: boolean; message: string }> {
    const url = `${API_BASE_URL}/api/blog/bulk`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slugs }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Lỗi khi xóa hàng loạt');
    }
    
    return response.json();
  }

  /**
   * Generate unique slug from title
   */
  static async generateSlug(title: string, excludeSlug?: string): Promise<{ success: boolean; data: { slug: string } }> {
    const url = `${API_BASE_URL}/api/blog/generate-slug`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, excludeSlug }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Lỗi khi tạo slug');
    }
    
    return response.json();
  }
}

/**
 * Format date string to Vietnamese locale
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};
