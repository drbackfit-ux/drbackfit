"use client";

import { useState, useEffect, useCallback } from "react";
import { Order } from "@/models/Order";
import { OrderStatus, OrderStatusType } from "@/models/OrderStatus";

interface OrderStatistics {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
}

interface UseAdminOrdersParams {
    status?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    pageLimit?: number;
    search?: string;
}

interface UseAdminOrdersResult {
    orders: Order[];
    statistics: OrderStatistics;
    loading: boolean;
    error: string | null;
    refetch: () => void;
    updateOrderStatus: (orderId: string, newStatus: OrderStatusType, note?: string) => Promise<void>;
}

/**
 * Hook for admin orders with polling updates (replacing Firestore real-time)
 */
export function useAdminOrders(params: UseAdminOrdersParams = {}): UseAdminOrdersResult {
    const [orders, setOrders] = useState<Order[]>([]);
    const [statistics, setStatistics] = useState<OrderStatistics>({
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        ordersByStatus: {},
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const {
        status = "all",
        sortBy = "createdAt",
        sortOrder = "desc",
        pageLimit = 50,
        search = "",
    } = params;

    const fetchOrders = useCallback(async () => {
        try {
            const queryParams = new URLSearchParams({
                page: "1",
                limit: pageLimit.toString(),
                status,
                sortBy,
                sortOrder,
                search,
            });

            const response = await fetch(`/api/admin/orders?${queryParams}`);
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Unauthorized");
                }
                throw new Error("Failed to fetch orders");
            }

            const data = await response.json();

            // Convert date strings to Date objects
            const parsedOrders = data.orders.map((order: any) => ({
                ...order,
                createdAt: new Date(order.createdAt),
                updatedAt: new Date(order.updatedAt),
                estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
                statusHistory: order.statusHistory.map((h: any) => ({
                    ...h,
                    timestamp: new Date(h.timestamp),
                })),
            }));

            setOrders(parsedOrders);
            setError(null);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(err instanceof Error ? err.message : "Failed to load orders");
        } finally {
            setLoading(false);
        }
    }, [status, sortBy, sortOrder, pageLimit, search]);

    const fetchStatistics = useCallback(async () => {
        try {
            const response = await fetch("/api/admin/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "statistics" }),
            });

            if (response.ok) {
                const data = await response.json();
                setStatistics(data.statistics);
            }
        } catch (err) {
            console.error("Error fetching statistics:", err);
        }
    }, []);

    // Initial fetch and polling
    useEffect(() => {
        setLoading(true);
        fetchOrders();
        fetchStatistics();

        // Poll every 10 seconds for "real-time" updates
        const intervalId = setInterval(() => {
            fetchOrders();
            fetchStatistics();
        }, 10000);

        return () => clearInterval(intervalId);
    }, [fetchOrders, fetchStatistics]);

    // Function to update order status
    const updateOrderStatus = useCallback(async (
        orderId: string,
        newStatus: OrderStatusType,
        note?: string
    ) => {
        try {
            const response = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus, note }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update order status");
            }

            // Refresh data immediately
            fetchOrders();
            fetchStatistics();
        } catch (err) {
            console.error("Error updating order status:", err);
            throw err;
        }
    }, [fetchOrders, fetchStatistics]);

    const refetch = useCallback(() => {
        setLoading(true);
        fetchOrders();
        fetchStatistics();
    }, [fetchOrders, fetchStatistics]);

    return {
        orders,
        statistics,
        loading,
        error,
        refetch,
        updateOrderStatus,
    };
}
