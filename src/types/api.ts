// Types cho Rating API
export interface RatingRequest {
  slug: string;
  userId: string;
  rating: number; // 1-5
}

export interface RatingResponse {
  message: string;
  rating: {
    _id: string;
    slug: string;
    userId: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
  };
}

// Types cho Comment API
export interface CommentRequest {
  slug: string;
  userId: string;
  userName: string;
  comment: string;
}

export interface CommentUpdateRequest {
  commentId: string;
  userId: string;
  comment: string;
}

export interface CommentResponse {
  message: string;
  comment: {
    _id: string;
    slug: string;
    userId: string;
    userName: string;
    comment: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface CommentsListResponse {
  comments: Array<{
    _id: string;
    slug: string;
    userId: string;
    userName: string;
    comment: string;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalComments: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Types cho Product Stats API
export interface ProductStatsResponse {
  slug: string;
  rating: {
    average: number;
    count: number;
    details: {
      [key: string]: number; // "1": 5, "2": 3, etc.
    };
    distribution: {
      [key: string]: number; // "1": 25%, "2": 15%, etc.
    };
  };
  recentComments: Array<{
    _id: string;
    userName: string;
    comment: string;
    createdAt: string;
  }>;
}

// Types cho error responses
export interface ApiErrorResponse {
  error: string;
}
