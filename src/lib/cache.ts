import "server-only";
import { revalidateTag, revalidatePath } from "next/cache";

export const CACHE_KEYS = {
  PRODUCTS: "products",
  PRODUCT: "product",
  TESTIMONIALS: "testimonials",
  CATEGORIES: "categories",
  CART: "cart",
} as const;

export type CacheKey = (typeof CACHE_KEYS)[keyof typeof CACHE_KEYS];

/**
 * Revalidate specific cache tags
 */
export function revalidateCache(tags: CacheKey | CacheKey[]) {
  const tagArray = Array.isArray(tags) ? tags : [tags];

  tagArray.forEach((tag) => {
    revalidateTag(tag, 'max');
  });
}

/**
 * Revalidate specific paths
 */
export function revalidatePages(paths: string | string[]) {
  const pathArray = Array.isArray(paths) ? paths : [paths];

  pathArray.forEach((path) => {
    revalidatePath(path);
  });
}

/**
 * Revalidate product-related cache
 */
export function revalidateProductCache() {
  revalidateCache([CACHE_KEYS.PRODUCTS, CACHE_KEYS.CATEGORIES]);
  revalidatePages(["/", "/catalog"]);
}

/**
 * Revalidate cart-related cache
 */
export function revalidateCartCache() {
  revalidateCache(CACHE_KEYS.CART);
  revalidatePages(["/cart", "/"]);
}
