import { z } from "zod";

/**
 * Order Status Enum
 * Represents the complete lifecycle of an order
 */
export const OrderStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

/**
 * Payment Status Enum
 */
export const PaymentStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export type PaymentStatusType =
  (typeof PaymentStatus)[keyof typeof PaymentStatus];

/**
 * Payment Method Enum
 */
export const PaymentMethod = {
  CARD: "card",
  PAYPAL: "paypal",
  COD: "cod", // Cash on Delivery
} as const;

export type PaymentMethodType =
  (typeof PaymentMethod)[keyof typeof PaymentMethod];

/**
 * Order Status Configuration
 * Defines display properties and behavior for each status
 */
export const OrderStatusConfig: Record<
  OrderStatusType,
  {
    label: string;
    description: string;
    color: string;
    bgColor: string;
    icon: string;
    canCancel: boolean;
    canRefund: boolean;
    nextStatuses: OrderStatusType[];
  }
> = {
  [OrderStatus.PENDING]: {
    label: "Pending",
    description: "Order placed, awaiting payment confirmation",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    icon: "⏳",
    canCancel: true,
    canRefund: false,
    nextStatuses: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  },
  [OrderStatus.CONFIRMED]: {
    label: "Confirmed",
    description: "Payment confirmed, processing order",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    icon: "✓",
    canCancel: true,
    canRefund: true,
    nextStatuses: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  },
  [OrderStatus.PROCESSING]: {
    label: "Processing",
    description: "Order is being prepared",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    icon: "📦",
    canCancel: false,
    canRefund: true,
    nextStatuses: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  },
  [OrderStatus.SHIPPED]: {
    label: "Shipped",
    description: "Order has been shipped",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    icon: "🚚",
    canCancel: false,
    canRefund: true,
    nextStatuses: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED],
  },
  [OrderStatus.OUT_FOR_DELIVERY]: {
    label: "Out for Delivery",
    description: "Order is out for delivery",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
    icon: "🚛",
    canCancel: false,
    canRefund: true,
    nextStatuses: [OrderStatus.DELIVERED],
  },
  [OrderStatus.DELIVERED]: {
    label: "Delivered",
    description: "Order delivered successfully",
    color: "text-green-600",
    bgColor: "bg-green-100",
    icon: "✅",
    canCancel: false,
    canRefund: true,
    nextStatuses: [OrderStatus.REFUNDED],
  },
  [OrderStatus.CANCELLED]: {
    label: "Cancelled",
    description: "Order cancelled",
    color: "text-red-600",
    bgColor: "bg-red-100",
    icon: "❌",
    canCancel: false,
    canRefund: false,
    nextStatuses: [],
  },
  [OrderStatus.REFUNDED]: {
    label: "Refunded",
    description: "Order refunded",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    icon: "💰",
    canCancel: false,
    canRefund: false,
    nextStatuses: [],
  },
};

/**
 * Helper Functions
 */

export const getOrderStatusConfig = (status: OrderStatusType) => {
  return OrderStatusConfig[status];
};

export const canCancelOrder = (status: OrderStatusType): boolean => {
  return OrderStatusConfig[status].canCancel;
};

export const canRefundOrder = (status: OrderStatusType): boolean => {
  return OrderStatusConfig[status].canRefund;
};

export const getNextStatuses = (
  currentStatus: OrderStatusType
): OrderStatusType[] => {
  return OrderStatusConfig[currentStatus].nextStatuses;
};

export const isOrderActive = (status: OrderStatusType): boolean => {
  const inactiveStatuses: OrderStatusType[] = [
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
    OrderStatus.REFUNDED,
  ];
  return !inactiveStatuses.includes(status);
};

export const isOrderCompleted = (status: OrderStatusType): boolean => {
  return status === OrderStatus.DELIVERED;
};

export const isOrderCancellable = (status: OrderStatusType): boolean => {
  return canCancelOrder(status);
};

/**
 * Zod Schemas for Validation
 */

export const OrderStatusSchema = z.enum([
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
]);

export const PaymentStatusSchema = z.enum([
  PaymentStatus.PENDING,
  PaymentStatus.COMPLETED,
  PaymentStatus.FAILED,
  PaymentStatus.REFUNDED,
]);

export const PaymentMethodSchema = z.enum([
  PaymentMethod.CARD,
  PaymentMethod.PAYPAL,
  PaymentMethod.COD,
]);
