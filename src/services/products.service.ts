import "server-only";
import { cache } from "react";
import { Product, ProductsSchema, ProductSchema } from "@/models/Product";
import { Testimonial, TestimonialsSchema } from "@/models/Common";
import { ProductDetail } from "@/models/ProductDetail";
import { productDetailServerFirestore, initializeServerFirestore } from "@/lib/firestore-product-detail-server";
import { getFirebaseAdminDb, hasAdminConfig } from "@/lib/firebase/server";
import seedData from "@/data/seed-data.json";
import accessoriesData from "@/data/accessories-data.json";

// Cache tags for revalidation
export const CACHE_TAGS = {
  PRODUCTS: "products",
  PRODUCT: "product",
  TESTIMONIALS: "testimonials",
} as const;

// Helper to ensure Firestore is initialized
function ensureFirestoreInitialized() {
  try {
    if (hasAdminConfig()) {
      const db = getFirebaseAdminDb();
      initializeServerFirestore(db);
    }
  } catch (error) {
    console.warn("⚠️ Firestore initialization failed in products.service:", error);
  }
}

/**
 * Convert ProductDetail to Product format for compatibility
 */
function productDetailToProduct(detail: ProductDetail): Product {
  return {
    id: detail.id,
    title: detail.title,
    slug: detail.slug,
    category: detail.category,
    shortDescription: detail.shortDescription,
    longDescription: detail.longDescription || "Crafted with precision and care.",
    images: detail.images.filter(img => img.trim()),
    priceEstimateMin: detail.pricing.salePrice || 1,
    priceEstimateMax: detail.pricing.mrp || detail.pricing.salePrice || 1,
    leadTimeDays: 30,
    tags: detail.tags && detail.tags.length > 0 ? detail.tags : ["New"],
    materials: detail.materials && detail.materials.length > 0 && detail.materials[0].trim() 
      ? detail.materials.filter(m => m.trim()) 
      : ["Premium Quality"],
    dimensions: {
      w: detail.dimensions.w || 1,
      h: detail.dimensions.h || 1,
      d: detail.dimensions.d || 1,
    },
    isCustomAllowed: true,
  };
}

/**
 * Get all products with caching
 * Fetches from Firestore ONLY - no seed data fallback
 */
export const getProducts = cache(async (): Promise<Product[]> => {
  try {
    // Check if Firebase is configured
    if (!hasAdminConfig()) {
      console.warn("⚠️ Firebase not configured on Vercel - returning empty array");
      return [];
    }

    // Ensure Firestore is initialized before use
    ensureFirestoreInitialized();
    
    // Directly use Firestore service (no HTTP call needed in server code)
    console.log(`📡 Fetching products from Firestore...`);
    
    const productDetails = await productDetailServerFirestore.getProducts();
    console.log(`✅ Fetched ${productDetails.length} products from Firestore`);
    
    if (productDetails.length > 0) {
      // Convert to Product format for compatibility
      const products = productDetails.map(productDetailToProduct);
      return ProductsSchema.parse(products);
    }

    // Return empty array if no products in Firestore
    console.warn("⚠️ No products found in Firestore");
    return [];
  } catch (error) {
    // Check if it's a Firebase configuration error
    if (error instanceof Error && 
        (error.message.includes("FIREBASE_NOT_CONFIGURED") || 
         error.message.includes("FIRESTORE_NOT_INITIALIZED"))) {
      console.warn("⚠️ Firebase not available - returning empty array");
      return [];
    }
    
    console.error("❌ Failed to fetch products from Firestore:", error);
    // Return empty array on error - NO SEED DATA
    return [];
  }
});

/**
 * Get products by category with caching
 */
export const getProductsByCategory = cache(
  async (category: string): Promise<Product[]> => {
    try {
      const products = await getProducts();
      return products.filter((product) => product.category === category);
    } catch (error) {
      console.error(
        `Failed to fetch products for category ${category}:`,
        error
      );
      throw new Error(`Failed to fetch products for category ${category}`);
    }
  }
);

/**
 * Get featured products (products marked for home featured section)
 * Returns ONLY products with homeFeatured flag - no fallback
 */
export const getFeaturedProducts = cache(async (): Promise<Product[]> => {
  try {
    // Check if Firebase is configured
    if (!hasAdminConfig()) {
      console.warn("⚠️ Firebase not configured on Vercel - returning empty array");
      return [];
    }

    // Ensure Firestore is initialized before use
    ensureFirestoreInitialized();
    
    console.log("⭐ Fetching featured products from Firestore...");
    
    // Directly use Firestore service to get products with homeFeatured flag
    const productDetails = await productDetailServerFirestore.getProducts();
    
    // Filter products marked for home featured section
    const featuredProducts = productDetails
      .filter(p => {
        const isFeatured = p.displayLocations?.homeFeatured === true;
        if (isFeatured) {
          console.log(`  ✓ Featured: "${p.title}"`);
        }
        return isFeatured;
      })
      .map(productDetailToProduct);
    
    console.log(`⭐ Found ${featuredProducts.length} featured products`);
    
    if (featuredProducts.length > 0) {
      return ProductsSchema.parse(featuredProducts);
    }
    
    // Return empty array if no products marked as featured
    console.warn("⚠️ No products marked for home featured section");
    return [];
  } catch (error) {
    // Check if it's a Firebase configuration error
    if (error instanceof Error && 
        (error.message.includes("FIREBASE_NOT_CONFIGURED") || 
         error.message.includes("FIRESTORE_NOT_INITIALIZED"))) {
      console.warn("⚠️ Firebase not available - returning empty array");
      return [];
    }
    
    console.error("❌ Failed to fetch featured products:", error);
    return [];
  }
});

/**
 * Get bestseller products (products marked for home bestseller section)
 * Returns ONLY products with homeBestseller flag - no fallback
 */
export const getBestsellerProducts = cache(async (): Promise<Product[]> => {
  try {
    // Check if Firebase is configured
    if (!hasAdminConfig()) {
      console.warn("⚠️ Firebase not configured on Vercel - returning empty array");
      return [];
    }

    // Ensure Firestore is initialized before use
    ensureFirestoreInitialized();
    
    console.log("🏆 Fetching bestseller products from Firestore...");
    
    // Directly use Firestore service to get products with homeBestseller flag
    const productDetails = await productDetailServerFirestore.getProducts();
    
    // Filter products marked for home bestseller section
    const bestsellerProducts = productDetails
      .filter(p => {
        const isBestseller = p.displayLocations?.homeBestseller === true;
        if (isBestseller) {
          console.log(`  ✓ Bestseller: "${p.title}"`);
        }
        return isBestseller;
      })
      .map(productDetailToProduct);
    
    console.log(`🏆 Found ${bestsellerProducts.length} bestseller products`);
    
    if (bestsellerProducts.length > 0) {
      return ProductsSchema.parse(bestsellerProducts);
    }
    
    // Return empty array if no products marked as bestseller
    console.warn("⚠️ No products marked for home bestseller section");
    return [];
  } catch (error) {
    // Check if it's a Firebase configuration error
    if (error instanceof Error && 
        (error.message.includes("FIREBASE_NOT_CONFIGURED") || 
         error.message.includes("FIRESTORE_NOT_INITIALIZED"))) {
      console.warn("⚠️ Firebase not available - returning empty array");
      return [];
    }
    
    console.error("❌ Failed to fetch bestseller products:", error);
    return [];
  }
});

/**
 * Get products for catalog page (products marked for catalog display)
 * Returns ONLY Firestore products - no fallback
 */
export const getCatalogProducts = cache(async (): Promise<Product[]> => {
  try {
    // Check if Firebase is configured
    if (!hasAdminConfig()) {
      console.warn("⚠️ Firebase not configured on Vercel - returning empty array");
      return [];
    }

    // Ensure Firestore is initialized before use
    ensureFirestoreInitialized();
    
    console.log("📚 Fetching catalog products from Firestore...");
    
    // Directly use Firestore service to get products with catalog flag
    const productDetails = await productDetailServerFirestore.getProducts();
    
    // Filter products marked for catalog page (or show all by default)
    const catalogProducts = productDetails
      .filter(p => p.displayLocations?.catalog !== false) // Show by default if not explicitly false
      .map(productDetailToProduct);
    
    console.log(`📚 Found ${catalogProducts.length} catalog products`);
    
    if (catalogProducts.length > 0) {
      return ProductsSchema.parse(catalogProducts);
    }
    
    // Return empty array if no products
    console.warn("⚠️ No products available for catalog");
    return [];
  } catch (error) {
    // Check if it's a Firebase configuration error
    if (error instanceof Error && 
        (error.message.includes("FIREBASE_NOT_CONFIGURED") || 
         error.message.includes("FIRESTORE_NOT_INITIALIZED"))) {
      console.warn("⚠️ Firebase not available - returning empty array");
      return [];
    }
    
    console.error("❌ Failed to fetch catalog products:", error);
    return [];
  }
});

/**
 * Get products for accessories page (products marked for accessories display)
 */
export const getAccessoriesProducts = cache(async (): Promise<Product[]> => {
  try {
    // Check if Firebase is configured
    if (!hasAdminConfig()) {
      console.warn("⚠️ Firebase not configured on Vercel - returning empty array");
      return [];
    }

    // Ensure Firestore is initialized before use
    ensureFirestoreInitialized();
    
    console.log("📦 Fetching accessories products from Firestore...");
    
    // Directly use Firestore service to get products with accessories flag
    const productDetails = await productDetailServerFirestore.getProducts();
    console.log(`✅ Fetched ${productDetails.length} total products from Firestore`);
    
    // Filter products marked for accessories page
    const accessoriesProducts = productDetails
      .filter(p => {
        const isAccessory = p.displayLocations?.accessories === true;
        if (isAccessory) {
          console.log(`  ✓ Product "${p.title}" marked for accessories page`);
        }
        return isAccessory;
      })
      .map(productDetailToProduct);
    
    console.log(`📦 Found ${accessoriesProducts.length} accessories products`);
    
    if (accessoriesProducts.length > 0) {
      return ProductsSchema.parse(accessoriesProducts);
    }
    
    console.log("⚠️ No products marked for accessories, returning empty array");
    return [];
  } catch (error) {
    // Check if it's a Firebase configuration error
    if (error instanceof Error && 
        (error.message.includes("FIREBASE_NOT_CONFIGURED") || 
         error.message.includes("FIRESTORE_NOT_INITIALIZED"))) {
      console.warn("⚠️ Firebase not available - returning empty array");
      return [];
    }
    
    console.error("❌ Failed to fetch accessories products:", error);
    // Return empty array instead of falling back to all products
    return [];
  }
});

/**
 * Get single product by slug
 */
export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    try {
      const products = await getProducts();
      const product = products.find((p) => p.slug === slug);

      if (!product) {
        return null;
      }

      // Validate single product
      return ProductSchema.parse(product);
    } catch (error) {
      console.error(`Failed to fetch product with slug ${slug}:`, error);
      throw new Error(`Failed to fetch product with slug ${slug}`);
    }
  }
);

/**
 * Search products by query
 */
export const searchProducts = cache(
  async (query: string): Promise<Product[]> => {
    try {
      const products = await getProducts();
      const lowercaseQuery = query.toLowerCase();

      return products.filter(
        (product) =>
          product.title.toLowerCase().includes(lowercaseQuery) ||
          product.shortDescription.toLowerCase().includes(lowercaseQuery) ||
          product.longDescription.toLowerCase().includes(lowercaseQuery) ||
          product.category.toLowerCase().includes(lowercaseQuery) ||
          product.materials.some((material) =>
            material.toLowerCase().includes(lowercaseQuery)
          ) ||
          product.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error(`Failed to search products with query "${query}":`, error);
      throw new Error("Failed to search products");
    }
  }
);

/**
 * Get testimonials with caching
 */
export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  try {
    // Validate testimonials from seed data
    const validatedTestimonials = TestimonialsSchema.parse(
      seedData.testimonials
    );

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 50));

    return validatedTestimonials;
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    throw new Error("Failed to fetch testimonials");
  }
});

/**
 * Get product categories with counts
 */
export const getProductCategories = cache(async () => {
  try {
    const products = await getProducts();
    const categoryCount = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: "Beds", slug: "beds", count: categoryCount.beds || 0 },
      { name: "Sofas", slug: "sofas", count: categoryCount.sofas || 0 },
      { name: "Couches", slug: "couches", count: categoryCount.couches || 0 },
      { name: "Custom", slug: "custom", count: categoryCount.custom || 0 },
    ];
  } catch (error) {
    console.error("Failed to fetch product categories:", error);
    throw new Error("Failed to fetch product categories");
  }
});
