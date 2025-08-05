import { IUser } from '@/models/User';

export interface UserResponse {
  success: boolean;
  data?: IUser[];
  error?: string;
  totalPages?: number;
  currentPage?: number;
  total?: number;
}

export interface SingleUserResponse {
  success: boolean;
  data?: IUser;
  error?: string;
  message?: string;
}

export interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
  weeklyUsers: number;
  activeUsers: number;
  bannedUsers: number;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

class UserService {
  // Helper method để tạo absolute URL
  private getAbsoluteUrl(path: string): string {
    if (typeof window === 'undefined') {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return `${baseUrl}${path}`;
    }
    return path;
  }

  // Lấy thống kê users
  async getUserStats(): Promise<UserStats> {
    try {
      const url = this.getAbsoluteUrl('/api/users/stats');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user stats: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.success ? result.data : result;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalUsers: 0,
        totalAdmins: 0,
        totalRegularUsers: 0,
        weeklyUsers: 0,
        activeUsers: 0,
        bannedUsers: 0,
      };
    }
  }

  // Lấy danh sách users với filter và pagination
  async getAllUsers(params: UserQueryParams = {}): Promise<UserResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.search) searchParams.append('search', params.search);
      if (params.role) searchParams.append('role', params.role);
      if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
      
      const relativePath = `/api/users${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      const url = this.getAbsoluteUrl(relativePath);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: 'Failed to fetch users',
        data: [],
      };
    }
  }

  // Lấy user theo ID
  async getUserById(id: string): Promise<IUser | null> {
    try {
      const url = this.getAbsoluteUrl(`/api/users/${id}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 }
      });
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return null;
    }
  }

  // Cập nhật user
  async updateUser(id: string, userData: Partial<IUser>): Promise<SingleUserResponse> {
    try {
      const url = this.getAbsoluteUrl(`/api/users/${id}`);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || `Failed to update user: ${response.statusText}`,
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: 'Failed to update user',
      };
    }
  }
}

export const userService = new UserService();
export default userService;
