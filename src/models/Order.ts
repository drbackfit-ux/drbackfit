import { z } from "zod";
import { Timestamp } from "firebase/firestore";
import {
    OrderStatusSchema,
    PaymentStatusSchema,
    PaymentMethodSchema,
    type OrderStatusType,
    type PaymentStatusType,
    type PaymentMethodType,
} from "./OrderStatus";

/**
 * Order Item Schema
 * Represents a single product in an order
 */
export const OrderItemSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    title: z.string().min(1, "Product title is required"),
    slug: z.string().min(1, "Product slug is required"),
    image: z.string().url("Invalid image URL"),
    price: z.number().positive("Price must be positive"),
    quantity: z.number().int().positive("Quantity must be positive"),
    subtotal: z.number().nonnegative("Subtotal must be non-negative"),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

/**
 * Customer Information Schema
 */
export const CustomerInfoSchema = z.object({
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

export type CustomerInfo = z.infer<typeof CustomerInfoSchema>;

/**
 * Shipping Address Schema
 */
export const ShippingAddressSchema = z.object({
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "ZIP code is required"),
    country: z.string().min(2, "Country is required").default("US"),
});

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

/**
 * Payment Information Schema
 */
export const PaymentInfoSchema = z.object({
    method: PaymentMethodSchema,
    status: PaymentStatusSchema,
    transactionId: z.string().optional(),
    lastFourDigits: z.string().length(4).optional(), // Last 4 digits of card
});

export type PaymentInfo = z.infer<typeof PaymentInfoSchema>;

/**
 * Order Status History Schema
 */
export const OrderStatusHistorySchema = z.object({
    status: OrderStatusSchema,
    timestamp: z.union([z.date(), z.instanceof(Timestamp)]),
    note: z.string().optional(),
    updatedBy: z.string().optional(), // Admin UID if updated by admin
});

export type OrderStatusHistory = z.infer<typeof OrderStatusHistorySchema>;

/**
 * Complete Order Schema
 */
export const OrderSchema = z.object({
    id: z.string().min(1, "Order ID is required"),
    orderNumber: z.string().min(1, "Order number is required"),
    userId: z.string().min(1, "User ID is required"),

    // Customer Information
    customer: CustomerInfoSchema,

    // Shipping Address
    shippingAddress: ShippingAddressSchema,

    // Order Items
    items: z.array(OrderItemSchema).min(1, "Order must have at least one item"),

    // Pricing
    subtotal: z.number().nonnegative("Subtotal must be non-negative"),
    tax: z.number().nonnegative("Tax must be non-negative"),
    shipping: z.number().nonnegative("Shipping must be non-negative"),
    total: z.number().positive("Total must be positive"),

    // Payment Information
    payment: PaymentInfoSchema,

    // Order Status
    status: OrderStatusSchema,
    statusHistory: z.array(OrderStatusHistorySchema),

    // Timestamps
    createdAt: z.union([z.date(), z.instanceof(Timestamp)]),
    updatedAt: z.union([z.date(), z.instanceof(Timestamp)]),

    // Additional Optional Fields
    notes: z.string().optional(),
    trackingNumber: z.string().optional(),
    estimatedDelivery: z.union([z.date(), z.instanceof(Timestamp)]).optional(),
});

export type Order = z.infer<typeof OrderSchema>;

/**
 * Order Creation Input Schema
 * Used when creating a new order from checkout
 */
export const OrderCreateInputSchema = z.object({
    // Customer Information
    customer: CustomerInfoSchema,

    // Shipping Address
    shippingAddress: ShippingAddressSchema,

    // Order Items
    items: z.array(OrderItemSchema).min(1, "Order must have at least one item"),

    // Pricing
    subtotal: z.number().nonnegative("Subtotal must be non-negative"),
    tax: z.number().nonnegative("Tax must be non-negative"),
    shipping: z.number().nonnegative("Shipping must be non-negative"),
    total: z.number().positive("Total must be positive"),

    // Payment Information
    payment: z.object({
        method: PaymentMethodSchema,
        lastFourDigits: z.string().length(4).optional(),
    }),

    // Optional
    notes: z.string().optional(),
});

export type OrderCreateInput = z.infer<typeof OrderCreateInputSchema>;

/**
 * Order Update Input Schema
 * Used when updating order status or details
 */
export const OrderUpdateInputSchema = z.object({
    status: OrderStatusSchema.optional(),
    trackingNumber: z.string().optional(),
    estimatedDelivery: z.union([z.date(), z.instanceof(Timestamp)]).optional(),
    notes: z.string().optional(),
    statusNote: z.string().optional(), // Note for status change
});

export type OrderUpdateInput = z.infer<typeof OrderUpdateInputSchema>;

/**
 * Order Summary Schema
 * Lightweight version for list views
 */
export const OrderSummarySchema = z.object({
    id: z.string(),
    orderNumber: z.string(),
    total: z.number(),
    status: OrderStatusSchema,
    itemCount: z.number().int().positive(),
    createdAt: z.union([z.date(), z.instanceof(Timestamp)]),
    thumbnailImage: z.string().url(), // First product image
});

export type OrderSummary = z.infer<typeof OrderSummarySchema>;

/**
 * Order Query Parameters Schema
 * For filtering and pagination
 */
export const OrderQueryParamsSchema = z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(10),
    status: z.union([OrderStatusSchema, z.literal("all")]).default("all"),
    search: z.string().optional(),
    sortBy: z.enum(["createdAt", "total", "status"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type OrderQueryParams = z.infer<typeof OrderQueryParamsSchema>;

/**
 * Order Statistics Schema
 * For admin dashboard
 */
export const OrderStatisticsSchema = z.object({
    totalOrders: z.number().int().nonnegative(),
    totalRevenue: z.number().nonnegative(),
    averageOrderValue: z.number().nonnegative(),
    ordersByStatus: z.record(OrderStatusSchema, z.number().int().nonnegative()),
    recentOrders: z.array(OrderSummarySchema),
});

export type OrderStatistics = z.infer<typeof OrderStatisticsSchema>;

/**
 * Helper Functions
 */

/**
 * Calculate order item subtotal
 */
export const calculateItemSubtotal = (
    price: number,
    quantity: number
): number => {
    return price * quantity;
};

/**
 * Calculate order total from items
 */
export const calculateOrderTotal = (
    items: OrderItem[],
    taxRate: number = 0.08,
    shippingCost: number = 0
): {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
} => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * taxRate;
    const shipping = shippingCost;
    const total = subtotal + tax + shipping;

    return {
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        shipping: Number(shipping.toFixed(2)),
        total: Number(total.toFixed(2)),
    };
};

/**
 * Validate order items match calculated totals
 */
export const validateOrderTotals = (order: {
    items: OrderItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
}): boolean => {
    const calculated = calculateOrderTotal(
        order.items,
        order.tax / order.subtotal,
        order.shipping
    );

    return (
        Math.abs(calculated.subtotal - order.subtotal) < 0.01 &&
        Math.abs(calculated.tax - order.tax) < 0.01 &&
        Math.abs(calculated.total - order.total) < 0.01
    );
};
