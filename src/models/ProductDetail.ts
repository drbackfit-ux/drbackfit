import { z } from "zod";
import { ProductSchema } from "./Product";

export const ProductRatingSchema = z.object({
  average: z.number().min(0).max(5),
  count: z.number().nonnegative(),
});

export const ProductPricingSchema = z.object({
  currency: z.string().min(1).default("INR"),
  mrp: z.number().positive(),
  salePrice: z.number().positive(),
  discountPercent: z.number().min(0),
  savingsAmount: z.number().min(0),
  couponPrice: z.number().positive().optional(),
  couponCode: z.string().optional(),
  couponDescription: z.string().optional(),
  emiText: z.string().optional(),
  taxInclusiveLabel: z.string().optional(),
});

export const ProductSizeOptionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  inStock: z.boolean(),
  isDefault: z.boolean().optional(),
});

export const ProductOfferSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().optional(),
  ctaLabel: z.string().optional(),
});

export const ProductDeliverySchema = z.object({
  placeholder: z.string().min(1).default("Enter pincode"),
  ctaLabel: z.string().min(1).default("Check"),
  helperText: z.string().optional(),
});

export const ProductServiceHighlightSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
});

export const ProductDetailSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  content: z.array(z.string().min(1)).default([]),
});

export const ProductFaqSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const ProductVideoShoppingSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  ctaLabel: z.string().min(1),
  ctaHref: z.string().min(1),
  imageUrl: z.string().url(),
});

export const ProductBreadcrumbSchema = z.object({
  label: z.string().min(1),
  href: z.string().optional(),
});

export const ProductWarrantySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const ProductDetailSchema = ProductSchema.extend({
  subtitle: z.string().min(1),
  rating: ProductRatingSchema,
  pricing: ProductPricingSchema,
  stockStatus: z.object({
    label: z.string().min(1),
    subLabel: z.string().optional(),
    inStock: z.boolean(),
  }),
  sizeOptions: z.array(ProductSizeOptionSchema).optional(),
  offers: z.array(ProductOfferSchema).default([]),
  delivery: ProductDeliverySchema.optional(),
  videoShopping: ProductVideoShoppingSchema,
  serviceHighlights: z.array(ProductServiceHighlightSchema).default([]),
  detailSections: z.array(ProductDetailSectionSchema),
  warranty: ProductWarrantySchema.optional(),
  breadcrumbs: z.array(ProductBreadcrumbSchema),
  ratingSummary: z
    .array(
      z.object({
        label: z.string().min(1),
        percentage: z.number().min(0).max(100),
      })
    )
    .default([]),
  overviewPoints: z.array(z.string().min(1)).default([]),
  faqs: z.array(ProductFaqSchema).default([]),
});

export type ProductDetail = z.infer<typeof ProductDetailSchema>;
export type ProductRating = z.infer<typeof ProductRatingSchema>;
export type ProductPricing = z.infer<typeof ProductPricingSchema>;
export type ProductSizeOption = z.infer<typeof ProductSizeOptionSchema>;
export type ProductOffer = z.infer<typeof ProductOfferSchema>;
export type ProductDelivery = z.infer<typeof ProductDeliverySchema>;
export type ProductServiceHighlight = z.infer<
  typeof ProductServiceHighlightSchema
>;
export type ProductDetailSection = z.infer<typeof ProductDetailSectionSchema>;
export type ProductVideoShopping = z.infer<typeof ProductVideoShoppingSchema>;
export type ProductBreadcrumb = z.infer<typeof ProductBreadcrumbSchema>;
export type ProductWarranty = z.infer<typeof ProductWarrantySchema>;
export type ProductFaq = z.infer<typeof ProductFaqSchema>;
