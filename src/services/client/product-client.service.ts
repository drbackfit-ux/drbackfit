/**
 * Client-side service for product operations
 * This service provides a simple API interface for product management
 * without complex state management dependencies
 */

export interface ProductData {
  id?: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  price: number;
  stock: number;
  section: 'featured' | 'trending' | 'new_arrival' | 'offers' | 'home_page';
  isActive: boolean;
  sku?: string;
  slug?: string;
  imageUrls?: string[];
  materials?: string[];
  dimensions?: {
    w: number;
    h: number;
    d: number;
  };
  leadTimeDays?: number;
  isCustomAllowed?: boolean;
  tags?: string[];
}

class ProductService {
  private baseUrl = '/api/products';

  async getProducts(params?: {
    section?: string;
    category?: string;
    includeInactive?: boolean;
  }): Promise<ProductData[]> {
    try {
      const url = new URL(this.baseUrl, window.location.origin);
      
      if (params?.section) {
        url.searchParams.append('section', params.section);
      }
      
      if (params?.category) {
        url.searchParams.append('category', params.category);
      }
      
      if (params?.includeInactive) {
        url.searchParams.append('includeInactive', 'true');
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<ProductData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }

      const data = await response.json();
      return data.product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async createProduct(productData: Omit<ProductData, 'id'>): Promise<{ id: string; message: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create product');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<ProductData>): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update product');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete product');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async searchProducts(searchTerm: string): Promise<ProductData[]> {
    try {
      // For now, get all products and filter client-side
      // In production, implement server-side search
      const products = await this.getProducts();
      
      const searchLower = searchTerm.toLowerCase();
      return products.filter(product => 
        product.title.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        (product.tags && product.tags.some(tag => 
          tag.toLowerCase().includes(searchLower)
        ))
      );
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
}

export const productService = new ProductService();
