import { getFirestore } from "firebase-admin/firestore";
import {
  Timestamp,
} from "firebase-admin/firestore";
import type { ProductDetail } from "@/models/ProductDetail";

// This will be initialized by the API route
let firestoreInstance: FirebaseFirestore.Firestore | null = null;

export function initializeServerFirestore(firestore: FirebaseFirestore.Firestore) {
  firestoreInstance = firestore;
}

const COLLECTION_NAME = "productDetails";

// Get db instance
const getDb = () => {
  if (!firestoreInstance) {
    throw new Error("Firestore not initialized. Call initializeServerFirestore first.");
  }
  return firestoreInstance;
};

export interface ProductDetailFilter {
  category?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
}

/**
 * Server-side Firestore service for ProductDetail operations
 */
export const productDetailServerFirestore = {
  /**
   * Add a new product detail to Firestore
   */
  async addProduct(productData: Omit<ProductDetail, "id">): Promise<string> {
    try {
      console.log("🔥 [Server] Adding document to collection:", COLLECTION_NAME);
      const db = getDb();
      const productsRef = db.collection(COLLECTION_NAME);
      
      const docRef = await productsRef.add({
        ...productData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      console.log("✅ [Server] Product added to Firestore with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ [Server] Firestore Error adding product:", error);
      if (error instanceof Error) {
        console.error("❌ [Server] Error message:", error.message);
        console.error("❌ [Server] Error stack:", error.stack);
      }
      throw new Error(error instanceof Error ? error.message : "Failed to add product detail");
    }
  },

  /**
   * Update an existing product detail
   */
  async updateProduct(
    productId: string,
    productData: Partial<ProductDetail>
  ): Promise<void> {
    try {
      console.log(`🔧 [Server] Updating product ${productId} in collection: ${COLLECTION_NAME}`);
      console.log(`📝 [Server] Update data keys:`, Object.keys(productData));
      
      const db = getDb();
      const productRef = db.collection(COLLECTION_NAME).doc(productId);
      
      // Check if document exists
      const doc = await productRef.get();
      if (!doc.exists) {
        console.error(`❌ [Server] Product ${productId} not found in Firestore`);
        throw new Error(`Product ${productId} not found`);
      }
      
      console.log(`✅ [Server] Product exists, updating...`);
      await productRef.update({
        ...productData,
        updatedAt: Timestamp.now(),
      });
      
      console.log(`✅ [Server] Product ${productId} updated successfully`);
    } catch (error) {
      console.error("❌ [Server] Error updating product detail:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update product detail");
    }
  },

  /**
   * Delete a product detail
   */
  async deleteProduct(productId: string): Promise<void> {
    try {
      const db = getDb();
      const productRef = db.collection(COLLECTION_NAME).doc(productId);
      await productRef.delete();
    } catch (error) {
      console.error("❌ [Server] Error deleting product detail:", error);
      throw new Error("Failed to delete product detail");
    }
  },

  /**
   * Get all product details with optional filtering
   */
  async getProducts(filters?: ProductDetailFilter): Promise<ProductDetail[]> {
    try {
      const db = getDb();
      let query: FirebaseFirestore.Query = db.collection(COLLECTION_NAME);

      if (filters?.category) {
        query = query.where("category", "==", filters.category);
      }

      if (filters?.inStock !== undefined) {
        query = query.where("stockStatus.inStock", "==", filters.inStock);
      }

      const snapshot = await query.get();
      const products: ProductDetail[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          ...data,
        } as ProductDetail);
      });

      // Apply additional filters that can't be done in Firestore query
      let filtered = products;

      if (filters?.minPrice !== undefined) {
        filtered = filtered.filter(
          (p) => p.pricing.salePrice >= filters.minPrice!
        );
      }

      if (filters?.maxPrice !== undefined) {
        filtered = filtered.filter(
          (p) => p.pricing.salePrice <= filters.maxPrice!
        );
      }

      if (filters?.tags && filters.tags.length > 0) {
        filtered = filtered.filter((p) =>
          p.tags?.some((tag) => filters.tags!.includes(tag))
        );
      }

      return filtered;
    } catch (error) {
      console.error("❌ [Server] Error fetching product details:", error);
      throw new Error("Failed to fetch product details");
    }
  },

  /**
   * Get a single product detail by ID
   */
  async getProductById(productId: string): Promise<ProductDetail | null> {
    try {
      const db = getDb();
      const productRef = db.collection(COLLECTION_NAME).doc(productId);
      const doc = await productRef.get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as ProductDetail;
    } catch (error) {
      console.error("❌ [Server] Error fetching product by ID:", error);
      throw new Error("Failed to fetch product");
    }
  },

  /**
   * Get a single product detail by slug
   */
  async getProductBySlug(slug: string): Promise<ProductDetail | null> {
    try {
      const db = getDb();
      const snapshot = await db
        .collection(COLLECTION_NAME)
        .where("slug", "==", slug)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as ProductDetail;
    } catch (error) {
      console.error("❌ [Server] Error fetching product by slug:", error);
      throw new Error("Failed to fetch product");
    }
  },

  /**
   * Search products by title or description
   */
  async searchProducts(searchTerm: string): Promise<ProductDetail[]> {
    try {
      const db = getDb();
      const snapshot = await db.collection(COLLECTION_NAME).get();

      const products: ProductDetail[] = [];
      const lowerSearchTerm = searchTerm.toLowerCase();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const title = data.title?.toLowerCase() || "";
        const description = data.shortDescription?.toLowerCase() || "";

        if (
          title.includes(lowerSearchTerm) ||
          description.includes(lowerSearchTerm)
        ) {
          products.push({
            id: doc.id,
            ...data,
          } as ProductDetail);
        }
      });

      return products;
    } catch (error) {
      console.error("❌ [Server] Error searching products:", error);
      throw new Error("Failed to search products");
    }
  },
};
