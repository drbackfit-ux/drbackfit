"use client";

import { useState, useEffect, useCallback } from "react";
import {
    collection,
    query,
    orderBy,
    where,
    onSnapshot,
    limit,
    Timestamp,
    QueryDocumentSnapshot,
    DocumentData
} from "firebase/firestore";
import { getFirebaseClientDb } from "@/lib/firebase/client";
import { Order, OrderQueryParams } from "@/models/Order";
import { useAuth } from "@/context/AuthContext";

/**
 * Convert Firestore document to Order type
 */
const convertFirestoreDocToOrder = (doc: QueryDocumentSnapshot<DocumentData>): Order => {
    const data = doc.data();

    const convertTimestamp = (ts: any): Date => {
        if (ts instanceof Timestamp) {
            return ts.toDate();
        }
        if (ts instanceof Date) {
            return ts;
        }
        if (ts && typeof ts.toDate === 'function') {
            return ts.toDate();
        }
        return new Date(ts);
    };

    return {
        ...data,
        id: doc.id,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        estimatedDelivery: data.estimatedDelivery ? convertTimestamp(data.estimatedDelivery) : undefined,
        statusHistory: data.statusHistory?.map((history: any) => ({
            ...history,
            timestamp: convertTimestamp(history.timestamp),
        })) || [],
    } as Order;
};

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

    const {
        page = 1,
        limit: pageLimit = 10,
        status = "all",
        sortBy = "createdAt",
        sortOrder = "desc",
    } = params || {};

    // Real-time subscription to user's orders
    useEffect(() => {
        if (!user || !firebaseUser) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const db = getFirebaseClientDb();
            const ordersRef = collection(db, "orders");

            // Build query for user's orders
            let q;
            if (status !== "all") {
                q = query(
                    ordersRef,
                    where("userId", "==", user.uid),
                    where("status", "==", status),
                    orderBy(sortBy, sortOrder),
                    limit(pageLimit + 1)
                );
            } else {
                q = query(
                    ordersRef,
                    where("userId", "==", user.uid),
                    orderBy(sortBy, sortOrder),
                    limit(pageLimit + 1)
                );
            }

            // Subscribe to real-time updates
            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const ordersList = snapshot.docs.map(convertFirestoreDocToOrder);
                    setHasMore(ordersList.length > pageLimit);
                    setOrders(ordersList.slice(0, pageLimit));
                    setLoading(false);
                },
                (err) => {
                    console.error("Error listening to orders:", err);
                    setError(err.message);
                    setLoading(false);
                }
            );

            // Cleanup listener on unmount
            return () => unsubscribe();
        } catch (err) {
            console.error("Error setting up orders listener:", err);
            setError(err instanceof Error ? err.message : "Failed to load orders");
            setLoading(false);
        }
    }, [user, firebaseUser, status, sortBy, sortOrder, pageLimit]);

    const refetch = useCallback(async () => {
        // For real-time listeners, refetch is automatic
        // This just forces a re-render
        setLoading(true);
        setTimeout(() => setLoading(false), 100);
    }, []);

    return {
        orders,
        loading,
        error,
        hasMore,
        refetch,
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

    // Real-time subscription to single order
    useEffect(() => {
        if (!user || !firebaseUser || !orderId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const db = getFirebaseClientDb();
            const ordersRef = collection(db, "orders");

            // Query by orderId (document ID)
            // For single document, we need to use a different approach
            // We'll query by order ID first, then verify ownership
            const q = query(
                ordersRef,
                where("userId", "==", user.uid),
                limit(100) // Get user's orders
            );

            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    // Find the specific order by ID
                    const orderDoc = snapshot.docs.find(doc => doc.id === orderId);

                    if (orderDoc) {
                        setOrder(convertFirestoreDocToOrder(orderDoc));
                    } else {
                        setError("Order not found");
                    }
                    setLoading(false);
                },
                (err) => {
                    console.error("Error listening to order:", err);
                    setError(err.message);
                    setLoading(false);
                }
            );

            return () => unsubscribe();
        } catch (err) {
            console.error("Error setting up order listener:", err);
            setError(err instanceof Error ? err.message : "Failed to load order");
            setLoading(false);
        }
    }, [user, firebaseUser, orderId]);

    const refetch = useCallback(async () => {
        // Real-time listener handles updates automatically
        setLoading(true);
        setTimeout(() => setLoading(false), 100);
    }, []);

    return {
        order,
        loading,
        error,
        refetch,
    };
}
