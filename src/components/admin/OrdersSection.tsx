"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Eye,
  Filter,
  Loader2,
  Package,
  RefreshCw,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminOrders } from "@/hooks/use-admin-orders";
import { Order } from "@/models/Order";
import {
  OrderStatus,
  OrderStatusConfig,
  getNextStatuses,
  type OrderStatusType
} from "@/models/OrderStatus";

// Status badge colors mapping
const STATUS_BADGE_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  out_for_delivery: "bg-cyan-100 text-cyan-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Format date - handles Date, string, and Firestore Timestamp
const formatDate = (date: any) => {
  let d: Date;
  if (typeof date === "string") {
    d = new Date(date);
  } else if (date instanceof Date) {
    d = date;
  } else if (date && typeof date.toDate === "function") {
    // Handle Firestore Timestamp
    d = date.toDate();
  } else {
    d = new Date(date);
  }
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function OrdersSection() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const { orders, statistics, loading, error, refetch, updateOrderStatus } = useAdminOrders({
    status: statusFilter,
    search: searchTerm,
    sortBy: "createdAt",
    sortOrder: "desc",
    pageLimit: 50,
  });

  // Calculate status metrics
  const statusMetrics = useMemo(() => {
    const statuses = [
      { status: "pending", label: "Pending" },
      { status: "processing", label: "Processing" },
      { status: "shipped", label: "Shipped" },
      { status: "delivered", label: "Delivered" },
      { status: "cancelled", label: "Cancelled" },
    ];

    return statuses.map(({ status, label }) => ({
      status: label,
      count: statistics.ordersByStatus[status] || 0,
      delta: 0, // Would need historical data for actual delta
    }));
  }, [statistics]);

  // Handle status change
  const handleStatusChange = async (orderId: string, newStatus: OrderStatusType) => {
    setIsUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
      // You could add a toast notification here
    } finally {
      setIsUpdating(null);
    }
  };

  // View order details
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  if (loading && orders.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-blue-100/30">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-slate-600">Loading orders...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-blue-100/30">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-blue-100/30">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Orders</h2>
          <p className="text-sm text-slate-600">
            {statistics.totalOrders} total orders • {formatCurrency(statistics.totalRevenue)} revenue
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={refetch}
          className="h-9 rounded-full border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {/* Status Metrics Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statusMetrics.map((metric) => {
          const isPositive = metric.delta >= 0;
          const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
          return (
            <Card
              key={metric.status}
              className="border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setStatusFilter(metric.status.toLowerCase())}
            >
              <CardContent className="flex items-center justify-between gap-3 py-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {metric.status}
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {metric.count}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Table */}
      <div className="mt-6 space-y-4 rounded-2xl border border-slate-100 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders or customers"
                className="pl-9 w-64"
              />
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-slate-500">
            Showing {orders.length} orders
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p>No orders found</p>
                    {statusFilter !== "all" && (
                      <Button
                        variant="link"
                        onClick={() => setStatusFilter("all")}
                        className="text-blue-600"
                      >
                        Clear filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const statusConfig = OrderStatusConfig[order.status as OrderStatusType];
                  const nextStatuses = getNextStatuses(order.status as OrderStatusType);

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-slate-900">
                        #{order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">
                            {order.customer.firstName} {order.customer.lastName}
                          </p>
                          <p className="text-sm text-slate-500">{order.customer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className={cn(
                                "h-auto py-1 px-3 font-semibold text-xs rounded-full",
                                STATUS_BADGE_COLORS[order.status] || "bg-gray-100 text-gray-700"
                              )}
                              disabled={isUpdating === order.id || nextStatuses.length === 0}
                            >
                              {isUpdating === order.id ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : null}
                              {statusConfig?.label || order.status}
                              {nextStatuses.length > 0 && (
                                <ChevronDown className="ml-1 h-3 w-3" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          {nextStatuses.length > 0 && (
                            <DropdownMenuContent align="start">
                              {nextStatuses.map((nextStatus) => (
                                <DropdownMenuItem
                                  key={nextStatus}
                                  onClick={() => handleStatusChange(order.id, nextStatus)}
                                >
                                  <span
                                    className={cn(
                                      "w-2 h-2 rounded-full mr-2",
                                      STATUS_BADGE_COLORS[nextStatus]?.split(" ")[0] || "bg-gray-300"
                                    )}
                                  />
                                  {OrderStatusConfig[nextStatus]?.label || nextStatus}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          )}
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-900">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Real-time indicator */}
        <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Real-time updates enabled. New orders will appear automatically.
        </div>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Placed on {selectedOrder && formatDate(selectedOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer & Shipping */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Customer</h4>
                  <p className="text-sm text-slate-600">
                    {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                  </p>
                  <p className="text-sm text-slate-600">{selectedOrder.customer.email}</p>
                  <p className="text-sm text-slate-600">{selectedOrder.customer.phone}</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Shipping Address</h4>
                  <p className="text-sm text-slate-600">{selectedOrder.shippingAddress.address}</p>
                  <p className="text-sm text-slate-600">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                  </p>
                  <p className="text-sm text-slate-600">{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title || "Product"}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-slate-900">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="text-slate-900">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax</span>
                  <span className="text-slate-900">{formatCurrency(selectedOrder.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <span className="text-slate-900">{formatCurrency(selectedOrder.shipping)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Status History */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Status History</h4>
                <div className="space-y-2">
                  {selectedOrder.statusHistory.map((history, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          STATUS_BADGE_COLORS[history.status] || "bg-gray-100 text-gray-700"
                        )}
                      >
                        {OrderStatusConfig[history.status as OrderStatusType]?.label || history.status}
                      </span>
                      <span className="text-slate-500">
                        {formatDate(history.timestamp)}
                      </span>
                      {history.note && (
                        <span className="text-slate-600">- {history.note}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
