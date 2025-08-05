import { ICategory } from '@/models/Category';

export interface CategoryResponse {
  success: boolean;
  data?: ICategory[];
  error?: string;
}

export interface SingleCategoryResponse {
  success: boolean;
  data?: ICategory;
  error?: string;
  message?: string;
}

export interface CategoryQueryParams {
  parentId?: string | null;
  level?: number;
  isActive?: boolean;
  includeInactive?: boolean;
}

class CategoryService {
    // Helper method để tạo absolute URL
    private getAbsoluteUrl(path: string): string {
        if (typeof window === 'undefined') {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            return `${baseUrl}${path}`;
        }
        return path;
    }

    // Lấy tất cả categories với filter
    async getAllCategories(params: CategoryQueryParams = {}): Promise<ICategory[]> {
        try {
            const searchParams = new URLSearchParams();
            
            if (params.parentId !== undefined) {
                searchParams.append('parentId', params.parentId || 'null');
            }
            if (params.level !== undefined) {
                searchParams.append('level', params.level.toString());
            }
            if (params.isActive !== undefined) {
                searchParams.append('isActive', params.isActive.toString());
            }
            if (params.includeInactive) {
                searchParams.append('includeInactive', 'true');
            }
            
            const relativePath = `/api/categories${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
            const url = this.getAbsoluteUrl(relativePath);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                next: { revalidate: 300 }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch categories: ${response.statusText}`);
            }

            const result = await response.json();
            return result.success ? result.data : result; // Backward compatibility
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    // Lấy category theo ID
    async getCategoryById(id: string): Promise<ICategory | null> {
        try {
            const url = this.getAbsoluteUrl(`/api/categories/${id}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                next: { revalidate: 300 }
            });
            
            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`Failed to fetch category: ${response.statusText}`);
            }
            
            const result = await response.json();
            return result.success ? result.data : null;
        } catch (error) {
            console.error(`Error fetching category ${id}:`, error);
            return null;
        }
    }

    // Tạo category mới
    async createCategory(categoryData: Partial<ICategory>): Promise<SingleCategoryResponse> {
        try {
            const url = this.getAbsoluteUrl('/api/categories');
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData),
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                return {
                    success: false,
                    error: result.error || `Failed to create category: ${response.statusText}`,
                };
            }
            
            return result;
        } catch (error) {
            console.error('Error creating category:', error);
            return {
                success: false,
                error: 'Failed to create category',
            };
        }
    }

    // Cập nhật category
    async updateCategory(id: string, categoryData: Partial<ICategory>): Promise<SingleCategoryResponse> {
        try {
            const url = this.getAbsoluteUrl(`/api/categories/${id}`);
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData),
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                return {
                    success: false,
                    error: result.error || `Failed to update category: ${response.statusText}`,
                };
            }
            
            return result;
        } catch (error) {
            console.error('Error updating category:', error);
            return {
                success: false,
                error: 'Failed to update category',
            };
        }
    }

    // Xóa category
    async deleteCategory(id: string): Promise<{ success: boolean; error?: string; message?: string }> {
        try {
            const url = this.getAbsoluteUrl(`/api/categories/${id}`);
            
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                return {
                    success: false,
                    error: result.error || `Failed to delete category: ${response.statusText}`,
                };
            }
            
            return result;
        } catch (error) {
            console.error('Error deleting category:', error);
            return {
                success: false,
                error: 'Failed to delete category',
            };
        }
    }

    // Lấy categories theo level
    async getCategoriesByLevel(level: number): Promise<ICategory[]> {
        return this.getAllCategories({ level });
    }

    // Lấy parent categories (level 1)
    async getParentCategories(): Promise<ICategory[]> {
        return this.getAllCategories({ level: 1, isActive: true });
    }

    // Lấy subcategories của một category
    async getSubcategories(parentId?: string): Promise<ICategory[]> {
        if (parentId) {
            return this.getAllCategories({ parentId, isActive: true });
        }
        return this.getAllCategories({ level: 2, isActive: true });
    }

    // Tạo slug từ tên
    generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
            .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
            .replace(/[ìíịỉĩ]/g, 'i')
            .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
            .replace(/[ùúụủũưừứựửữ]/g, 'u')
            .replace(/[ỳýỵỷỹ]/g, 'y')
            .replace(/[đ]/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }
}

export const categoryService = new CategoryService();
export default categoryService;
