import { IProduct } from '@/models/Product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Response interfaces phù hợp với API thực tế
export interface ProductsResponse {
  products: IProduct[];
  total?: number;
}

export interface ProductResponse {
  product: IProduct;
  relatedProducts?: IProduct[];
}

export interface ProductQueryParams {
  category?: string;
  tags?: string; // Tags as comma-separated string như API route
  search?: string;
  featured?: boolean;
  hotTrend?: boolean;
  // Thêm pagination support (tương thích với MongoDB client code cũ)
  page?: number;
  limit?: number;
}

class ProductService {
  // Helper method để tạo absolute URL
  private getAbsoluteUrl(path: string): string {
    // Nếu đang chạy trên server (SSR)
    if (typeof window === 'undefined') {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return `${baseUrl}${path}`;
    }
    // Nếu đang chạy trên client
    return path;
  }

  // Lấy tất cả sản phẩm với các tùy chọn filter - Match với API route thực tế
  async getProducts(params: ProductQueryParams = {}): Promise<IProduct[]> {
    const searchParams = new URLSearchParams();
    
    // Chỉ thêm params có giá trị
    if (params.category) searchParams.append('category', params.category);
    if (params.tags) searchParams.append('tags', params.tags);
    if (params.search) searchParams.append('search', params.search);
    if (params.featured) searchParams.append('featured', 'true');
    if (params.hotTrend) searchParams.append('hotTrend', 'true');
    
    const relativePath = `/api/products${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const url = this.getAbsoluteUrl(relativePath);
    
    // Nếu không có filter, không cache để tránh stale data khi clear filters
    const cacheOption = (params.category || params.tags || params.search || params.featured || params.hotTrend) 
      ? { next: { revalidate: 60 } } 
      : { cache: 'no-store' as RequestCache };
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...cacheOption
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    
    const products: IProduct[] = await response.json();
    return products;
  }

  // Lấy sản phẩm với pagination support (tương thích với MongoDB client code cũ)
  async getProductsWithPagination(params: ProductQueryParams = {}): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams();
    
    // Thêm các filter params
    if (params.category) searchParams.append('category', params.category);
    if (params.tags) searchParams.append('tags', params.tags);
    if (params.search) searchParams.append('search', params.search);
    if (params.featured) searchParams.append('featured', 'true');
    if (params.hotTrend) searchParams.append('hotTrend', 'true');
    
    // Thêm pagination params
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    
    const relativePath = `/api/products${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const url = this.getAbsoluteUrl(relativePath);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Nếu response có structure pagination, trả về như vậy (MongoDB client code)
    if (result.success && result.data) {
      return {
        products: result.data.products,
        total: result.data.pagination?.total
      };
    }
    
    // Nếu response là array (non-pagination), wrap trong ProductsResponse
    return {
      products: result as IProduct[],
      total: result.length
    };
  }
  
  // Lấy tất cả sản phẩm (không filter) - cho trang chủ
  async getAllProducts(): Promise<IProduct[]> {
    return this.getProducts();
  }
  
  // Lấy sản phẩm theo category
  async getProductsByCategory(categoryId: string): Promise<IProduct[]> {
    return this.getProducts({ category: categoryId });
  }
  
  // Lấy sản phẩm theo tags (array)
  async getProductsByTags(tags: string[]): Promise<IProduct[]> {
    const tagsString = tags.join(',');
    return this.getProducts({ tags: tagsString });
  }
  
  // Lấy sản phẩm theo category và tags
  async getProductsByCategoryAndTags(categoryId: string, tags: string[]): Promise<IProduct[]> {
    const tagsString = tags.join(',');
    return this.getProducts({ 
      category: categoryId, 
      tags: tagsString 
    });
  }
  
  // Lấy sản phẩm featured (sử dụng route API thay vì filter client-side)
  async getFeaturedProducts(): Promise<IProduct[]> {
    return this.getProducts({ featured: true });
  }
  
  // Lấy sản phẩm hot trend (sử dụng route API thay vì filter client-side)
  async getHotTrendProducts(): Promise<IProduct[]> {
    return this.getProducts({ hotTrend: true });
  }
  
  // Các methods khác (nếu cần API routes riêng)
  // Lấy chi tiết sản phẩm theo ID
  async getProductById(id: string): Promise<IProduct | null> {
    try {
      const relativePath = `/api/products/${id}`;
      const url = this.getAbsoluteUrl(relativePath);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 } 
      });
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }
  }
  
  // Lấy chi tiết sản phẩm theo slug
  async getProductBySlug(slug: string): Promise<IProduct | null> {
    try {
      const relativePath = `/api/products/slug/${slug}`;
      const url = this.getAbsoluteUrl(relativePath);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 }
      });
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Kiểm tra format response từ API
      if (result.success && result.data && result.data.product) {
        return result.data.product as IProduct;
      } else if (result._id || result.productId) {
        // Nếu response trực tiếp là product object
        return result as IProduct;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching product by slug ${slug}:`, error);
      return null;
    }
  }
  
  // Lấy chi tiết sản phẩm theo slug kèm related products
  async getProductBySlugWithRelated(slug: string): Promise<ProductResponse | null> {
    try {
      const relativePath = `/api/products/slug/${slug}`;
      const url = this.getAbsoluteUrl(relativePath);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 }
      });
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Kiểm tra format response từ API
      if (result.success && result.data) {
        return {
          product: result.data.product as IProduct,
          relatedProducts: result.data.relatedProducts as IProduct[] || []
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching product with related by slug ${slug}:`, error);
      return null;
    }
  }

  // Tìm kiếm sản phẩm (sử dụng route API với search filter)
  async searchProducts(query: string): Promise<IProduct[]> {
    return this.getProducts({ search: query });
  }

  // Tìm kiếm sản phẩm với advanced filters
  async searchProductsAdvanced(query: string, params?: {
    category?: string;
    tags?: string[];
    featured?: boolean;
    hotTrend?: boolean;
  }): Promise<IProduct[]> {
    return this.getProductsWithAdvancedFilters({
      search: query,
      ...params
    });
  }

  
  // Method này sử dụng route hiện tại với logic category và tags phức tạp
  async getProductsWithAdvancedFilters(params: {
    category?: string;
    tags?: string[];
    search?: string;
    featured?: boolean;
    hotTrend?: boolean;
  }): Promise<IProduct[]> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.category) {
        searchParams.append('category', params.category);
      }
      
      if (params.tags && params.tags.length > 0) {
        searchParams.append('tags', params.tags.join(','));
      }

      if (params.search) {
        searchParams.append('search', params.search);
      }

      if (params.featured) {
        searchParams.append('featured', 'true');
      }

      if (params.hotTrend) {
        searchParams.append('hotTrend', 'true');
      }
      
      const relativePath = `/api/products${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      const url = this.getAbsoluteUrl(relativePath);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      
      const products: IProduct[] = await response.json();
      return products;
    } catch (error) {
      console.error('Error fetching products with advanced filters:', error);
      return [];
    }
  }

  // Lấy sản phẩm theo category (sử dụng logic từ route - level 1 sẽ include subcategories)
  async getProductsByCategoryAdvanced(categoryId: string): Promise<IProduct[]> {
    return this.getProductsWithAdvancedFilters({ category: categoryId });
  }

  // Lấy sản phẩm theo tags (sử dụng logic từ route)
  async getProductsByTagsAdvanced(tags: string[]): Promise<IProduct[]> {
    return this.getProductsWithAdvancedFilters({ tags });
  }

  // Lấy sản phẩm theo cả category và tags (sử dụng logic từ route)
  async getProductsByCategoryAndTagsAdvanced(categoryId: string, tags: string[]): Promise<IProduct[]> {
    return this.getProductsWithAdvancedFilters({ 
      category: categoryId, 
      tags 
    });
  }

  // Method wrapper để tương thích với logic cũ nhưng sử dụng route mới
  async getProductsByCategoryWithSubcategories(categoryId: string): Promise<IProduct[]> {
    // Route sẽ tự động handle logic level 1 includes subcategories
    return this.getProductsByCategoryAdvanced(categoryId);
  }
}

export const productService = new ProductService();
export default productService;
