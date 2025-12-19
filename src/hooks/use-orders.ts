"use client";

import { useState, useEffect } from "react";
import { Order, OrderQueryParams } from "@/models/Order";
import { useAuth } from "@/context/AuthContext";

interface UseOrdersResult {
    orders: Order[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    refetch: () => Promise<void>;
}

export function useOrders(params?: Partial<OrderQueryParams>): UseOrdersResult {
    const { user, firebaseUser } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);

    const fetchOrders = async () => {
        if (!user || !firebaseUser) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Get auth token
            const token = await firebaseUser.getIdToken();

            // Build query string
            const queryParams = new URLSearchParams();
            if (params?.page) queryParams.append("page", params.page.toString());
            if (params?.limit) queryParams.append("limit", params.limit.toString());
            if (params?.status) queryParams.append("status", params.status.toString());
            if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
            if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

            // Fetch orders
            const response = await fetch(`/api/orders?${queryParams.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to fetch orders");
            }

            const data = await response.json();
            setOrders(data.orders);
            setHasMore(data.hasMore);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user, params?.page, params?.limit, params?.status, params?.sortBy, params?.sortOrder]);

    return {
        orders,
        loading,
        error,
        hasMore,
        refetch: fetchOrders,
    };
}

interface UseOrderResult {
    order: Order | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useOrder(orderId: string): UseOrderResult {
    const { user, firebaseUser } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrder = async () => {
        if (!user || !firebaseUser || !orderId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Get auth token
            const token = await firebaseUser.getIdToken();

            // Fetch order
            const response = await fetch(`/api/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to fetch order");
            }

            const data = await response.json();
            setOrder(data.order);
        } catch (err) {
            console.error("Error fetching order:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch order");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [user, orderId]);

    return {
        order,
        loading,
        error,
        refetch: fetchOrder,
    };
}
