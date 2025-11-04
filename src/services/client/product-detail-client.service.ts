import type { ProductDetail } from "@/models/ProductDetail";

export interface ProductDetailFilter {
  category?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
}

/**
 * Client-side service for ProductDetail API operations
 */
export const productDetailService = {
  /**
   * Fetch all product details
   */
  async getProducts(filters?: ProductDetailFilter): Promise<ProductDetail[]> {
    const params = new URLSearchParams();
    
    if (filters?.category) {
      params.append("category", filters.category);
    }
    
    if (filters?.inStock !== undefined) {
      params.append("inStock", String(filters.inStock));
    }
    
    if (filters?.minPrice !== undefined) {
      params.append("minPrice", String(filters.minPrice));
    }
    
    if (filters?.maxPrice !== undefined) {
      params.append("maxPrice", String(filters.maxPrice));
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      params.append("tags", filters.tags.join(","));
    }
    
    const url = `/api/product-details${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    
    return response.json();
  },

  /**
   * Fetch a single product detail by ID
   */
  async getProductById(id: string): Promise<ProductDetail> {
    const response = await fetch(`/api/product-details/${id}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }
    
    return response.json();
  },

  /**
   * Create a new product detail
   */
  async createProduct(product: Partial<ProductDetail>): Promise<{ id: string }> {
    try {
      const response = await fetch("/api/product-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("❌ API Error:", errorData);
        throw new Error(errorData.error || errorData.details || "Failed to create product");
      }
      
      return response.json();
    } catch (error) {
      console.error("❌ Create product error:", error);
      throw error;
    }
  },

  /**
   * Update an existing product detail
   */
  async updateProduct(id: string, product: Partial<ProductDetail>): Promise<void> {
    console.log(`🔄 Updating product ${id}...`);
    const response = await fetch(`/api/product-details/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Update failed:`, response.status, errorText);
      throw new Error(`Failed to update product: ${response.status} - ${errorText}`);
    }
    
    console.log(`✅ Product ${id} updated successfully`);
  },

  /**
   * Delete a product detail
   */
  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`/api/product-details/${id}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete product");
    }
  },
};
