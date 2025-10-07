import { z } from "zod";

// Cart item schema
export const CartItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  image: z.string().url(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  slug: z.string().min(1),
});

export const CartSchema = z.object({
  items: z.array(CartItemSchema),
  total: z.number().nonnegative(),
  itemCount: z.number().int().nonnegative(),
});

// Add to cart payload schema
export const AddToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

// Update cart item schema
export const UpdateCartItemSchema = z.object({
  id: z.string().min(1),
  quantity: z.number().int().nonnegative(),
});

// TypeScript types
export type CartItem = z.infer<typeof CartItemSchema>;
export type Cart = z.infer<typeof CartSchema>;
export type AddToCartPayload = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemPayload = z.infer<typeof UpdateCartItemSchema>;
