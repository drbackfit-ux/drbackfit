import { z } from "zod";

// Zod schemas for validation
export const ProductDimensionsSchema = z.object({
  w: z.number().positive(),
  h: z.number().positive(),
  d: z.number().positive(),
});

export const ProductSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  shortDescription: z.string().min(1),
  longDescription: z.string().min(1),
  category: z.string().min(1),
  images: z.array(z.string().url()).min(1),
  priceEstimateMin: z.number().positive(),
  priceEstimateMax: z.number().positive(),
  materials: z.array(z.string()).min(1),
  dimensions: ProductDimensionsSchema,
  leadTimeDays: z.number().positive(),
  isCustomAllowed: z.boolean(),
  tags: z.array(z.string()),
});

export const ProductsSchema = z.array(ProductSchema);

// TypeScript types derived from schemas
export type ProductDimensions = z.infer<typeof ProductDimensionsSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Products = z.infer<typeof ProductsSchema>;

// Category enum for better type safety
export const ProductCategory = {
  BEDS: "beds",
  SOFAS: "sofas",
  COUCHES: "couches",
  CUSTOM: "custom",
} as const;

export type ProductCategoryType =
  (typeof ProductCategory)[keyof typeof ProductCategory];
