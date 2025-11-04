import { z } from "zod";
import { Timestamp } from "firebase/firestore";

// Enhanced product schema for e-commerce functionality
export const EcommerceProductSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(), // Single price instead of price range
  stock: z.number().nonnegative(),
  imageUrls: z.array(z.string().url()).min(1), // Cloudinary URLs
  section: z.enum(["featured", "trending", "new_arrival", "offers", "home_page"]),
  isActive: z.boolean().default(true),
  sku: z.string().optional(),
  slug: z.string().min(1),
  
  // Additional product details (optional)
  shortDescription: z.string().optional(),
  materials: z.array(z.string()).optional(),
  dimensions: z.object({
    w: z.number().positive(),
    h: z.number().positive(),
    d: z.number().positive(),
  }).optional(),
  leadTimeDays: z.number().positive().optional(),
  isCustomAllowed: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  
  // Timestamps
  createdAt: z.union([z.date(), z.instanceof(Timestamp)]),
  updatedAt: z.union([z.date(), z.instanceof(Timestamp)]),
});

// Product input schema for forms (without timestamps)
export const ProductInputSchema = EcommerceProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Product update schema (all fields optional except id)
export const ProductUpdateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  stock: z.number().nonnegative().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  section: z.enum(["featured", "trending", "new_arrival", "offers", "home_page"]).optional(),
  isActive: z.boolean().optional(),
  sku: z.string().optional(),
  slug: z.string().min(1).optional(),
  shortDescription: z.string().optional(),
  materials: z.array(z.string()).optional(),
  dimensions: z.object({
    w: z.number().positive(),
    h: z.number().positive(),
    d: z.number().positive(),
  }).optional(),
  leadTimeDays: z.number().positive().optional(),
  isCustomAllowed: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export type EcommerceProduct = z.infer<typeof EcommerceProductSchema>;
export type ProductInput = z.infer<typeof ProductInputSchema>;
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>;

// Section options for display
export const PRODUCT_SECTIONS = {
  FEATURED: "featured",
  TRENDING: "trending", 
  NEW_ARRIVAL: "new_arrival",
  OFFERS: "offers",
  HOME_PAGE: "home_page",
} as const;

export const PRODUCT_SECTION_LABELS = {
  [PRODUCT_SECTIONS.FEATURED]: "Featured",
  [PRODUCT_SECTIONS.TRENDING]: "Trending",
  [PRODUCT_SECTIONS.NEW_ARRIVAL]: "New Arrivals",
  [PRODUCT_SECTIONS.OFFERS]: "Offers",
  [PRODUCT_SECTIONS.HOME_PAGE]: "Home Page",
} as const;

// Category options
export const PRODUCT_CATEGORIES = {
  BEDS: "beds",
  SOFAS: "sofas", 
  COUCHES: "couches",
  CUSTOM: "custom",
  ACCESSORIES: "accessories",
} as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[keyof typeof PRODUCT_CATEGORIES];
export type ProductSection = typeof PRODUCT_SECTIONS[keyof typeof PRODUCT_SECTIONS];
