import { 
  RatingRequest, 
  RatingResponse, 
  CommentRequest, 
  CommentUpdateRequest,
  CommentResponse, 
  CommentsListResponse, 
  ProductStatsResponse,
  ApiErrorResponse 
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Rating Services
export class RatingService {
  // Thêm hoặc cập nhật rating
  static async submitRating(data: RatingRequest): Promise<RatingResponse> {    
    const response = await fetch(`${API_BASE_URL}/api/rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json();
      throw new Error(errorData.error || 'Lỗi khi gửi rating');
    }

    return response.json();
  }

  // Lấy rating của user cho sản phẩm
  static async getUserRating(slug: string, userId: string): Promise<RatingResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/rating?slug=${slug}&userId=${userId}`
    );

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json();
      throw new Error(errorData.error || 'Lỗi khi lấy rating');
    }

    return response.json();
  }

  // Xóa rating
  static async deleteRating(slug: string, userId: string): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/api/rating?slug=${slug}&userId=${userId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json();
      throw new Error(errorData.error || 'Lỗi khi xóa rating');
    }

    return response.json();
  }
}

// Comment Services
export class CommentService {
  // Thêm comment mới
  static async addComment(data: CommentRequest): Promise<CommentResponse> {
    const response = await fetch(`${API_BASE_URL}/api/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json();
      throw new Error(errorData.error || 'Lỗi khi thêm comment');
    }

    return response.json();
  }

  static async getComments(
    slug: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<CommentsListResponse> {
    const params = new URLSearchParams({
      slug,
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    const response = await fetch(`${API_BASE_URL}/api/comment?${params}`);

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json();
      throw new Error(errorData.error || 'Lỗi khi lấy comments');
    }

    return response.json();
  }

  static async updateComment(data: CommentUpdateRequest): Promise<CommentResponse> {
    const response = await fetch(`${API_BASE_URL}/api/comment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json();
      throw new Error(errorData.error || 'Lỗi khi cập nhật comment');
    }

    return response.json();
  }

  // Xóa comment
  static async deleteComment(commentId: string, userId: string): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/api/comment?commentId=${commentId}&userId=${userId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json();
      throw new Error(errorData.error || 'Lỗi khi xóa comment');
    }

    return response.json();
  }
}

// Product Stats Service
export class ProductStatsService {
  // Lấy thống kê rating và comment của sản phẩm
  static async getProductStats(slug: string): Promise<ProductStatsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/product-stats?slug=${slug}`);

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json();
      throw new Error(errorData.error || 'Lỗi khi lấy thống kê sản phẩm');
    }

    return response.json();
  }
}

// Utility functions
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
