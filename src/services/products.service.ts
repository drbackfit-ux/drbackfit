import "server-only";
import { cache } from "react";
import { Product, ProductsSchema, ProductSchema } from "@/models/Product";
import { Testimonial, TestimonialsSchema } from "@/models/Common";
import seedData from "@/data/seed-data.json";

// Cache tags for revalidation
export const CACHE_TAGS = {
  PRODUCTS: "products",
  PRODUCT: "product",
  TESTIMONIALS: "testimonials",
} as const;

/**
 * Get all products with caching
 * Uses React cache() for deduplication and Next.js ISR for periodic revalidation
 */
export const getProducts = cache(async (): Promise<Product[]> => {
  try {
    // In a real app, this would be a fetch to your API/database
    // For now, we'll use the seed data with proper validation
    const validatedProducts = ProductsSchema.parse(seedData.products);

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));

    return validatedProducts;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw new Error("Failed to fetch products");
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
 * Get featured products (first 4 products)
 */
export const getFeaturedProducts = cache(async (): Promise<Product[]> => {
  try {
    const products = await getProducts();
    return products.slice(0, 4);
  } catch (error) {
    console.error("Failed to fetch featured products:", error);
    throw new Error("Failed to fetch featured products");
  }
});

/**
 * Get bestseller products
 */
export const getBestsellerProducts = cache(async (): Promise<Product[]> => {
  try {
    const products = await getProducts();
    return products
      .filter((product) => product.tags.includes("Bestseller"))
      .slice(0, 3);
  } catch (error) {
    console.error("Failed to fetch bestseller products:", error);
    throw new Error("Failed to fetch bestseller products");
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
