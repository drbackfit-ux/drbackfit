// ============================================================================
// Type definitions
// ============================================================================

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Canceled";

export type OrderStatusMetric = {
  status: OrderStatus;
  count: number;
  delta: number;
};

export type OrderRow = {
  orderId: string;
  customer: string;
  total: string;
  status: OrderStatus;
  fulfillmentEta: string;
  channel: "Online" | "Showroom" | "Wholesale";
  placedOn: string;
};

export type CustomerMetric = {
  label: string;
  value: string;
  change: string;
  trendingUp: boolean;
};

export type CustomerSegment = {
  segment: "Loyal" | "New" | "Inactive";
  customers: number;
  description: string;
  change: string;
  trendingUp: boolean;
};

export type ProductAlert = {
  name: string;
  sku: string;
  stockLeft: number;
  threshold: number;
};

export type TopSeller = {
  name: string;
  units: number;
  revenue: string;
};

export type InventorySku = {
  sku: string;
  name: string;
  stock: number;
  status: "Low" | "Healthy" | "Reorder";
};

export type TrafficPoint = {
  label: string;
  visits: number;
  conversions: number;
};

export type ConversionMetric = {
  label: string;
  value: string;
  change: string;
  trendingUp: boolean;
};

export type SupportTicket = {
  id: string;
  customer: string;
  subject: string;
  priority: "High" | "Medium" | "Low";
};

export type TransactionStatus = "Completed" | "Refunded" | "Pending";

export type TransactionRow = {
  id: string;
  orderId: string;
  customer: string;
  amount: string;
  method: "Stripe" | "PayPal" | "Razorpay";
  status: TransactionStatus;
  timestamp: string;
};

export type ShippingMethod = {
  name: string;
  carrier: "FedEx" | "DHL" | "UPS" | "Royal Mail";
  transitTime: string;
  baseRate: string;
  active: boolean;
};

export type DeliveryEvent = {
  id: string;
  carrier: string;
  status: string;
  description: string;
  timestamp: string;
};

// ============================================================================
// Mock Data
// ============================================================================

export const ORDER_STATUS_METRICS: OrderStatusMetric[] = [
  { status: "Pending", count: 18, delta: -4 },
  { status: "Processing", count: 27, delta: 6 },
  { status: "Shipped", count: 44, delta: 9 },
  { status: "Delivered", count: 312, delta: 18 },
  { status: "Canceled", count: 6, delta: -1 },
];

export const ORDERS: OrderRow[] = [
  {
    orderId: "#84219",
    customer: "Emily Carter",
    total: "$1,540.00",
    status: "Processing",
    fulfillmentEta: "2 days",
    channel: "Online",
    placedOn: "Oct 17, 2025",
  },
  {
    orderId: "#84218",
    customer: "Daniel Kim",
    total: "$2,180.00",
    status: "Pending",
    fulfillmentEta: "Awaiting payment",
    channel: "Showroom",
    placedOn: "Oct 17, 2025",
  },
  {
    orderId: "#84217",
    customer: "Samantha Lee",
    total: "$3,420.00",
    status: "Shipped",
    fulfillmentEta: "Out for delivery",
    channel: "Online",
    placedOn: "Oct 16, 2025",
  },
  {
    orderId: "#84216",
    customer: "GreenNest Hotels",
    total: "$11,760.00",
    status: "Processing",
    fulfillmentEta: "4 days",
    channel: "Wholesale",
    placedOn: "Oct 16, 2025",
  },
  {
    orderId: "#84215",
    customer: "Robert Hughes",
    total: "$980.00",
    status: "Delivered",
    fulfillmentEta: "Delivered Oct 14",
    channel: "Online",
    placedOn: "Oct 14, 2025",
  },
  {
    orderId: "#84214",
    customer: "Skyline Retreat",
    total: "$8,240.00",
    status: "Shipped",
    fulfillmentEta: "Due Oct 20",
    channel: "Wholesale",
    placedOn: "Oct 14, 2025",
  },
  {
    orderId: "#84213",
    customer: "Isabella Flores",
    total: "$1,260.00",
    status: "Delivered",
    fulfillmentEta: "Delivered Oct 13",
    channel: "Online",
    placedOn: "Oct 12, 2025",
  },
  {
    orderId: "#84212",
    customer: "William Harris",
    total: "$1,120.00",
    status: "Canceled",
    fulfillmentEta: "Refund pending",
    channel: "Showroom",
    placedOn: "Oct 11, 2025",
  },
];

export const CUSTOMER_METRICS: CustomerMetric[] = [
  {
    label: "Total customers",
    value: "12,438",
    change: "+3.8%",
    trendingUp: true,
  },
  {
    label: "New signups (7d)",
    value: "612",
    change: "+11.4%",
    trendingUp: true,
  },
  {
    label: "Active customers",
    value: "8,904",
    change: "+2.1%",
    trendingUp: true,
  },
  { label: "Churn risk", value: "2.3%", change: "-0.4%", trendingUp: false },
];

export const CUSTOMER_SEGMENTS: CustomerSegment[] = [
  {
    segment: "Loyal",
    customers: 3540,
    description: "3+ purchases, high CLV",
    change: "+6.2%",
    trendingUp: true,
  },
  {
    segment: "New",
    customers: 1188,
    description: "First purchase within 30 days",
    change: "+14.5%",
    trendingUp: true,
  },
  {
    segment: "Inactive",
    customers: 942,
    description: "No purchase in 90 days",
    change: "-3.1%",
    trendingUp: false,
  },
];

export const LOW_STOCK_ALERTS: ProductAlert[] = [
  {
    name: "Serenity Hybrid Queen",
    sku: "MAT-SHY-QN",
    stockLeft: 6,
    threshold: 12,
  },
  {
    name: "Luna Memory Foam Twin XL",
    sku: "MAT-LMF-TXL",
    stockLeft: 4,
    threshold: 10,
  },
  { name: "Atlas Firm King", sku: "MAT-AFM-KG", stockLeft: 9, threshold: 15 },
];

export const TOP_SELLERS: TopSeller[] = [
  { name: "Serenity Hybrid King", units: 142, revenue: "$186,460" },
  { name: "Nimbus Cooling Mattress", units: 118, revenue: "$142,900" },
  { name: "Atlas Firm Queen", units: 96, revenue: "$109,440" },
];

export const INVENTORY_SKUS: InventorySku[] = [
  {
    sku: "MAT-SHY-KG",
    name: "Serenity Hybrid King",
    stock: 54,
    status: "Healthy",
  },
  { sku: "MAT-CLD-QN", name: "Nimbus Cooling Queen", stock: 18, status: "Low" },
  { sku: "MAT-AFM-FT", name: "Atlas Firm Full", stock: 35, status: "Healthy" },
  {
    sku: "MAT-LMF-TXL",
    name: "Luna Memory Foam Twin XL",
    stock: 9,
    status: "Reorder",
  },
  {
    sku: "MAT-TRN-CK",
    name: "Tranquil Plush California King",
    stock: 22,
    status: "Low",
  },
];

export const TRAFFIC_SERIES: TrafficPoint[] = [
  { label: "Mon", visits: 4920, conversions: 382 },
  { label: "Tue", visits: 5180, conversions: 401 },
  { label: "Wed", visits: 4860, conversions: 364 },
  { label: "Thu", visits: 5420, conversions: 426 },
  { label: "Fri", visits: 5680, conversions: 449 },
  { label: "Sat", visits: 6020, conversions: 462 },
  { label: "Sun", visits: 5840, conversions: 455 },
];

export const CONVERSION_METRICS: ConversionMetric[] = [
  {
    label: "Visit-to-cart rate",
    value: "18.6%",
    change: "+1.4%",
    trendingUp: true,
  },
  {
    label: "Cart-to-checkout rate",
    value: "64.2%",
    change: "+2.3%",
    trendingUp: true,
  },
  {
    label: "Checkout drop-off",
    value: "5.1%",
    change: "-0.6%",
    trendingUp: false,
  },
  {
    label: "Returning customer rate",
    value: "42.8%",
    change: "+3.2%",
    trendingUp: true,
  },
];

export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "T-1452",
    customer: "Avery Chen",
    subject: "Concern about mattress firmness",
    priority: "High",
  },
  {
    id: "T-1451",
    customer: "Noah Patel",
    subject: "Request for expedited shipping",
    priority: "Medium",
  },
  {
    id: "T-1450",
    customer: "River House B&B",
    subject: "Wholesale pricing follow-up",
    priority: "Low",
  },
];

export const TRANSACTIONS: TransactionRow[] = [
  {
    id: "TX-9921",
    orderId: "#84216",
    customer: "GreenNest Hotels",
    amount: "$11,760.00",
    method: "Stripe",
    status: "Completed",
    timestamp: "Oct 16, 10:32 AM",
  },
  {
    id: "TX-9920",
    orderId: "#84215",
    customer: "Robert Hughes",
    amount: "$980.00",
    method: "PayPal",
    status: "Completed",
    timestamp: "Oct 14, 4:16 PM",
  },
  {
    id: "TX-9919",
    orderId: "#84214",
    customer: "Skyline Retreat",
    amount: "$8,240.00",
    method: "Razorpay",
    status: "Pending",
    timestamp: "Oct 14, 2:54 PM",
  },
  {
    id: "TX-9918",
    orderId: "#84213",
    customer: "Isabella Flores",
    amount: "$1,260.00",
    method: "Stripe",
    status: "Refunded",
    timestamp: "Oct 13, 11:08 AM",
  },
  {
    id: "TX-9917",
    orderId: "#84212",
    customer: "William Harris",
    amount: "$1,120.00",
    method: "PayPal",
    status: "Pending",
    timestamp: "Oct 11, 5:42 PM",
  },
];

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    name: "Standard Ground",
    carrier: "FedEx",
    transitTime: "3-5 business days",
    baseRate: "$35.00",
    active: true,
  },
  {
    name: "Expedited Air",
    carrier: "DHL",
    transitTime: "2 business days",
    baseRate: "$68.00",
    active: true,
  },
  {
    name: "White-Glove Delivery",
    carrier: "UPS",
    transitTime: "5-7 business days",
    baseRate: "$129.00",
    active: false,
  },
  {
    name: "EU Premium Freight",
    carrier: "Royal Mail",
    transitTime: "7-10 business days",
    baseRate: "$156.00",
    active: true,
  },
];

export const DELIVERY_FEED: DeliveryEvent[] = [
  {
    id: "DL-4332",
    carrier: "DHL",
    status: "Label generated",
    description: "Order #84214 ready for DHL Express pickup",
    timestamp: "Oct 18, 4:22 PM",
  },
  {
    id: "DL-4331",
    carrier: "FedEx",
    status: "In transit",
    description: "Order #84217 departed Charlotte sort facility",
    timestamp: "Oct 18, 12:15 PM",
  },
  {
    id: "DL-4330",
    carrier: "UPS",
    status: "Delivered",
    description: "White-glove delivery for Order #84208 completed",
    timestamp: "Oct 17, 6:48 PM",
  },
  {
    id: "DL-4329",
    carrier: "DHL",
    status: "Exception",
    description: "Order #84205 delayed due to customs documentation",
    timestamp: "Oct 17, 8:32 AM",
  },
];

// ============================================================================
// Style Maps
// ============================================================================

export const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-sky-100 text-sky-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  Canceled: "bg-rose-100 text-rose-700",
};

export const INVENTORY_STATUS_STYLES: Record<InventorySku["status"], string> = {
  Healthy: "bg-emerald-100 text-emerald-700",
  Low: "bg-amber-100 text-amber-700",
  Reorder: "bg-rose-100 text-rose-700",
};

export const TRANSACTION_STATUS_STYLES: Record<TransactionStatus, string> = {
  Completed: "bg-emerald-100 text-emerald-700",
  Refunded: "bg-blue-100 text-blue-700",
  Pending: "bg-amber-100 text-amber-700",
};

export const SUPPORT_PRIORITY_STYLES: Record<
  SupportTicket["priority"],
  string
> = {
  High: "bg-rose-100 text-rose-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-slate-100 text-slate-700",
};

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Get all admin dashboard data
 * In production, this would fetch from databases/APIs
 */
export async function getAdminDashboardData() {
  return {
    orderMetrics: ORDER_STATUS_METRICS,
    orders: ORDERS,
    customerMetrics: CUSTOMER_METRICS,
    customerSegments: CUSTOMER_SEGMENTS,
    lowStockAlerts: LOW_STOCK_ALERTS,
    topSellers: TOP_SELLERS,
    inventorySkus: INVENTORY_SKUS,
    trafficSeries: TRAFFIC_SERIES,
    conversionMetrics: CONVERSION_METRICS,
    supportTickets: SUPPORT_TICKETS,
    transactions: TRANSACTIONS,
    shippingMethods: SHIPPING_METHODS,
    deliveryFeed: DELIVERY_FEED,
  };
}

/**
 * Get orders with optional filtering
 */
export async function getOrders(filters?: {
  status?: OrderStatus | "All";
  channel?: "Online" | "Showroom" | "Wholesale" | "All";
  searchTerm?: string;
}) {
  let filtered = [...ORDERS];

  if (filters?.status && filters.status !== "All") {
    filtered = filtered.filter((order) => order.status === filters.status);
  }

  if (filters?.channel && filters.channel !== "All") {
    filtered = filtered.filter((order) => order.channel === filters.channel);
  }

  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (order) =>
        order.orderId.toLowerCase().includes(term) ||
        order.customer.toLowerCase().includes(term)
    );
  }

  return filtered;
}

/**
 * Get customer insights
 */
export async function getCustomerInsights() {
  return {
    metrics: CUSTOMER_METRICS,
    segments: CUSTOMER_SEGMENTS,
    supportTickets: SUPPORT_TICKETS,
  };
}

/**
 * Get inventory data
 */
export async function getInventoryData() {
  return {
    lowStockAlerts: LOW_STOCK_ALERTS,
    topSellers: TOP_SELLERS,
    inventorySkus: INVENTORY_SKUS,
  };
}

/**
 * Get analytics data
 */
export async function getAnalyticsData() {
  return {
    trafficSeries: TRAFFIC_SERIES,
    conversionMetrics: CONVERSION_METRICS,
  };
}

/**
 * Get shipping data
 */
export async function getShippingData() {
  return {
    shippingMethods: SHIPPING_METHODS,
    deliveryFeed: DELIVERY_FEED,
  };
}

/**
 * Get payment data
 */
export async function getPaymentData() {
  return {
    transactions: TRANSACTIONS,
  };
}
