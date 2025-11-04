import { getFirebaseClientDb } from "@/lib/firebase/client";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import type { ProductDetail } from "@/models/ProductDetail";

const COLLECTION_NAME = "productDetails";

// Get db instance
const getDb = () => getFirebaseClientDb();

export interface ProductDetailFilter {
  category?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
}

/**
 * Firestore service for ProductDetail operations
 */
export const productDetailFirestore = {
  /**
   * Add a new product detail to Firestore
   */
  async addProduct(productData: Omit<ProductDetail, "id">): Promise<string> {
    try {
      console.log("🔥 Initializing Firestore...");
      const db = getDb();
      console.log("🔥 Firestore initialized, getting collection...");
      const productsRef = collection(db, COLLECTION_NAME);
      console.log("🔥 Adding document to collection:", COLLECTION_NAME);
      
      const docRef = await addDoc(productsRef, {
        ...productData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      console.log("✅ Product added to Firestore with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ Firestore Error adding product:", error);
      if (error instanceof Error) {
        console.error("❌ Error message:", error.message);
        console.error("❌ Error stack:", error.stack);
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
      const db = getDb();
      const productRef = doc(db, COLLECTION_NAME, productId);
      await updateDoc(productRef, {
        ...productData,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating product detail:", error);
      throw new Error("Failed to update product detail");
    }
  },

  /**
   * Delete a product detail
   */
  async deleteProduct(productId: string): Promise<void> {
    try {
      const db = getDb();
      const productRef = doc(db, COLLECTION_NAME, productId);
      await deleteDoc(productRef);
    } catch (error) {
      console.error("Error deleting product detail:", error);
      throw new Error("Failed to delete product detail");
    }
  },

  /**
   * Get all product details with optional filtering
   */
  async getProducts(filters?: ProductDetailFilter): Promise<ProductDetail[]> {
    try {
      const db = getDb();
      const productsRef = collection(db, COLLECTION_NAME);
      const constraints: QueryConstraint[] = [];

      if (filters?.category) {
        constraints.push(where("category", "==", filters.category));
      }

      if (filters?.inStock !== undefined) {
        constraints.push(where("stockStatus.inStock", "==", filters.inStock));
      }

      if (filters?.tags && filters.tags.length > 0) {
        constraints.push(where("tags", "array-contains-any", filters.tags));
      }

      constraints.push(orderBy("createdAt", "desc"));

      const q = query(productsRef, ...constraints);
      const querySnapshot = await getDocs(q);

      let products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProductDetail[];

      // Client-side filtering for price range
      if (filters?.minPrice !== undefined) {
        products = products.filter(
          (p) => p.pricing.salePrice >= filters.minPrice!
        );
      }

      if (filters?.maxPrice !== undefined) {
        products = products.filter(
          (p) => p.pricing.salePrice <= filters.maxPrice!
        );
      }

      return products;
    } catch (error) {
      console.error("Error fetching product details:", error);
      throw new Error("Failed to fetch product details");
    }
  },

  /**
   * Get a single product detail by ID
   */
  async getProductById(productId: string): Promise<ProductDetail | null> {
    try {
      const db = getDb();
      const productRef = doc(db, COLLECTION_NAME, productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        return null;
      }

      return {
        id: productSnap.id,
        ...productSnap.data(),
      } as ProductDetail;
    } catch (error) {
      console.error("Error fetching product detail:", error);
      throw new Error("Failed to fetch product detail");
    }
  },

  /**
   * Get a product detail by slug
   */
  async getProductBySlug(slug: string): Promise<ProductDetail | null> {
    try {
      const db = getDb();
      const productsRef = collection(db, COLLECTION_NAME);
      const q = query(productsRef, where("slug", "==", slug));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as ProductDetail;
    } catch (error) {
      console.error("Error fetching product by slug:", error);
      throw new Error("Failed to fetch product by slug");
    }
  },

  /**
   * Get all product slugs (for static generation)
   */
  async getAllSlugs(): Promise<string[]> {
    try {
      const db = getDb();
      const productsRef = collection(db, COLLECTION_NAME);
      const querySnapshot = await getDocs(productsRef);

      return querySnapshot.docs.map((doc) => doc.data().slug as string);
    } catch (error) {
      console.error("Error fetching product slugs:", error);
      throw new Error("Failed to fetch product slugs");
    }
  },

  /**
   * Search products by title or description
   */
  async searchProducts(searchTerm: string): Promise<ProductDetail[]> {
    try {
      const db = getDb();
      // Note: Firestore doesn't support full-text search natively
      // For better search, consider using Algolia or similar service
      const productsRef = collection(db, COLLECTION_NAME);
      const querySnapshot = await getDocs(productsRef);

      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProductDetail[];

      // Client-side filtering
      const searchLower = searchTerm.toLowerCase();
      return products.filter(
        (product) =>
          product.title.toLowerCase().includes(searchLower) ||
          product.shortDescription.toLowerCase().includes(searchLower) ||
          product.longDescription.toLowerCase().includes(searchLower) ||
          product.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error("Error searching products:", error);
      throw new Error("Failed to search products");
    }
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<ProductDetail[]> {
    return this.getProducts({ category });
  },

  /**
   * Get similar products (by category and tags)
   */
  async getSimilarProducts(
    productId: string,
    limit: number = 4
  ): Promise<ProductDetail[]> {
    try {
      const product = await this.getProductById(productId);
      if (!product) return [];

      const similarProducts = await this.getProducts({
        category: product.category,
      });

      // Filter out the current product and limit results
      return similarProducts
        .filter((p) => p.id !== productId)
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching similar products:", error);
      return [];
    }
  },
};
