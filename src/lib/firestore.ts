import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp
} from "firebase/firestore";
import { getFirebaseClientDb } from "@/lib/firebase/client";
import { 
  EcommerceProduct, 
  ProductInput, 
  ProductUpdate,
  EcommerceProductSchema,
  ProductSection 
} from "@/models/EcommerceProduct";

const PRODUCTS_COLLECTION = "products";

// Helper function to convert Firestore document to Product type
const convertFirestoreDoc = (doc: QueryDocumentSnapshot<DocumentData>): EcommerceProduct => {
  const data = doc.data();
  
  // Convert Firestore Timestamps to Date objects for validation
  const productData = {
    ...data,
    id: doc.id,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
  };

  return EcommerceProductSchema.parse(productData);
};

// Generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

export const firestoreService = {
  // Add a new product
  async addProduct(productData: ProductInput): Promise<string> {
    try {
      const db = getFirebaseClientDb();
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      
      // Generate slug if not provided
      const slug = productData.slug || generateSlug(productData.title);
      
      const docRef = await addDoc(productsRef, {
        ...productData,
        slug,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log("Product added with ID: ", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error adding product: ", error);
      throw new Error("Failed to add product");
    }
  },

  // Update an existing product
  async updateProduct(id: string, updates: Partial<ProductUpdate>): Promise<void> {
    try {
      const db = getFirebaseClientDb();
      const productRef = doc(db, PRODUCTS_COLLECTION, id);
      
      // Generate new slug if title is being updated
      if (updates.title && !updates.slug) {
        updates.slug = generateSlug(updates.title);
      }
      
      await updateDoc(productRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      console.log("Product updated: ", id);
    } catch (error) {
      console.error("Error updating product: ", error);
      throw new Error("Failed to update product");
    }
  },

  // Delete a product
  async deleteProduct(id: string): Promise<void> {
    try {
      const db = getFirebaseClientDb();
      const productRef = doc(db, PRODUCTS_COLLECTION, id);
      
      await deleteDoc(productRef);
      console.log("Product deleted: ", id);
    } catch (error) {
      console.error("Error deleting product: ", error);
      throw new Error("Failed to delete product");
    }
  },

  // Get all products
  async getProducts(): Promise<EcommerceProduct[]> {
    try {
      const db = getFirebaseClientDb();
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const q = query(productsRef, orderBy("createdAt", "desc"));
      
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(convertFirestoreDoc);
      
      return products;
    } catch (error) {
      console.error("Error fetching products: ", error);
      throw new Error("Failed to fetch products");
    }
  },

  // Get products by section
  async getProductsBySection(section: ProductSection): Promise<EcommerceProduct[]> {
    try {
      const db = getFirebaseClientDb();
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const q = query(
        productsRef, 
        where("section", "==", section),
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(convertFirestoreDoc);
      
      return products;
    } catch (error) {
      console.error("Error fetching products by section: ", error);
      throw new Error(`Failed to fetch products for section: ${section}`);
    }
  },

  // Get products by category
  async getProductsByCategory(category: string): Promise<EcommerceProduct[]> {
    try {
      const db = getFirebaseClientDb();
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const q = query(
        productsRef, 
        where("category", "==", category),
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(convertFirestoreDoc);
      
      return products;
    } catch (error) {
      console.error("Error fetching products by category: ", error);
      throw new Error(`Failed to fetch products for category: ${category}`);
    }
  },

  // Get a single product by ID
  async getProductById(id: string): Promise<EcommerceProduct | null> {
    try {
      const db = getFirebaseClientDb();
      const productRef = doc(db, PRODUCTS_COLLECTION, id);
      const docSnapshot = await getDoc(productRef);
      
      if (!docSnapshot.exists()) {
        return null;
      }
      
      return convertFirestoreDoc(docSnapshot as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error("Error fetching product by ID: ", error);
      throw new Error(`Failed to fetch product with ID: ${id}`);
    }
  },

  // Get a single product by slug
  async getProductBySlug(slug: string): Promise<EcommerceProduct | null> {
    try {
      const db = getFirebaseClientDb();
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const q = query(
        productsRef, 
        where("slug", "==", slug),
        where("isActive", "==", true)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      // Return the first match (slugs should be unique)
      return convertFirestoreDoc(querySnapshot.docs[0]);
    } catch (error) {
      console.error("Error fetching product by slug: ", error);
      throw new Error(`Failed to fetch product with slug: ${slug}`);
    }
  },

  // Search products by title or description
  async searchProducts(searchTerm: string): Promise<EcommerceProduct[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation that gets all products and filters client-side
      // For production, consider using Algolia or similar for better search
      const products = await this.getProducts();
      
      const searchLower = searchTerm.toLowerCase();
      return products.filter(product => 
        product.isActive && (
          product.title.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchLower))
        )
      );
    } catch (error) {
      console.error("Error searching products: ", error);
      throw new Error("Failed to search products");
    }
  }
};
