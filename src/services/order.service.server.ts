import "server-only";

import { getFirebaseAdminDb } from "@/lib/firebase/server";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import {
    Order,
    OrderCreateInput,
    OrderSchema,
    OrderStatusHistory,
} from "@/models/Order";
import { OrderStatus, PaymentStatus } from "@/models/OrderStatus";
import { generateOrderNumber } from "./orderNumber.service.server";
import { emailService } from "./email.service.server";

const ORDERS_COLLECTION = "orders";
const USERS_COLLECTION = "users";

/**
 * Convert Firestore document to Order type
 */
const convertFirestoreDocToOrder = (doc: FirebaseFirestore.DocumentSnapshot): Order => {
    const data = doc.data();
    if (!data) throw new Error("Document data is undefined");

    const orderData = {
        ...data,
        id: doc.id,
        createdAt:
            data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : data.createdAt,
        updatedAt:
            data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate()
                : data.updatedAt,
        estimatedDelivery: data.estimatedDelivery
            ? data.estimatedDelivery instanceof Timestamp
                ? data.estimatedDelivery.toDate()
                : data.estimatedDelivery
            : undefined,
        statusHistory: data.statusHistory.map((history: any) => ({
            ...history,
            timestamp:
                history.timestamp instanceof Timestamp
                    ? history.timestamp.toDate()
                    : history.timestamp,
        })),
    };

    return OrderSchema.parse(orderData);
};

/**
 * Server-side Order Service using Firebase Admin SDK
 * Use this in API routes and server components
 */
export const orderServiceServer = {
    /**
     * Create a new order
     */
    async createOrder(
        userId: string,
        orderInput: OrderCreateInput
    ): Promise<Order> {
        try {
            const db = getFirebaseAdminDb();

            // Generate unique order number
            const orderNumber = await generateOrderNumber();

            // Create initial status history
            const initialStatusHistory: OrderStatusHistory = {
                status: OrderStatus.PENDING,
                timestamp: new Date(),
                note: "Order placed",
            };

            // Prepare order data
            const orderData = {
                orderNumber,
                userId,
                customer: orderInput.customer,
                shippingAddress: orderInput.shippingAddress,
                items: orderInput.items,
                subtotal: orderInput.subtotal,
                tax: orderInput.tax,
                shipping: orderInput.shipping,
                total: orderInput.total,
                payment: {
                    method: orderInput.payment.method,
                    status: PaymentStatus.PENDING,
                    ...(orderInput.payment.lastFourDigits ? { lastFourDigits: orderInput.payment.lastFourDigits } : {}),
                },
                status: OrderStatus.PENDING,
                statusHistory: [initialStatusHistory],
                ...(orderInput.notes ? { notes: orderInput.notes } : {}),
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            };

            // Create order in Firestore
            const ordersRef = db.collection(ORDERS_COLLECTION);
            const orderDocRef = await ordersRef.add(orderData);

            // Also create a summary in user's subcollection for quick queries
            await db.collection(USERS_COLLECTION).doc(userId).collection("orders").add({
                orderId: orderDocRef.id,
                orderNumber,
                total: orderInput.total,
                status: OrderStatus.PENDING,
                itemCount: orderInput.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                ),
                thumbnailImage: orderInput.items[0]?.image || "",
                createdAt: FieldValue.serverTimestamp(),
            });

            // Fetch the created order
            const createdOrderDoc = await orderDocRef.get();
            if (!createdOrderDoc.exists) {
                throw new Error("Failed to retrieve created order");
            }

            const order = convertFirestoreDocToOrder(createdOrderDoc);

            console.log("Order created successfully:", order.orderNumber);

            // Send order confirmation email (async, non-blocking)
            emailService.sendOrderConfirmationEmail(order).catch((err) => {
                console.error("Failed to send order confirmation email:", err);
            });

            return order;
        } catch (error) {
            console.error("Error creating order:", error);
            throw new Error(
                `Failed to create order: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },

    /**
     * Get order by ID
     */
    async getOrderById(orderId: string, userId?: string): Promise<Order | null> {
        try {
            const db = getFirebaseAdminDb();
            const orderDoc = await db.collection(ORDERS_COLLECTION).doc(orderId).get();

            if (!orderDoc.exists) {
                return null;
            }

            const order = convertFirestoreDocToOrder(orderDoc);

            // If userId is provided, verify ownership
            if (userId && order.userId !== userId) {
                throw new Error("Unauthorized: Order does not belong to user");
            }

            return order;
        } catch (error) {
            console.error("Error fetching order:", error);
            throw new Error(
                `Failed to fetch order: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },

    /**
     * Get order by order number
     */
    async getOrderByNumber(
        orderNumber: string,
        userId?: string
    ): Promise<Order | null> {
        try {
            const db = getFirebaseAdminDb();
            const querySnapshot = await db
                .collection(ORDERS_COLLECTION)
                .where("orderNumber", "==", orderNumber)
                .get();

            if (querySnapshot.empty) {
                return null;
            }

            const order = convertFirestoreDocToOrder(querySnapshot.docs[0]);

            // If userId is provided, verify ownership
            if (userId && order.userId !== userId) {
                throw new Error("Unauthorized: Order does not belong to user");
            }

            return order;
        } catch (error) {
            console.error("Error fetching order by number:", error);
            throw new Error(
                `Failed to fetch order: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },

    /**
     * Get all orders for a user
     */
    async getUserOrders(
        userId: string,
        params: { page?: number; limit?: number; status?: string; sortBy?: string; sortOrder?: string } = {}
    ): Promise<{ orders: Order[]; hasMore: boolean }> {
        try {
            const db = getFirebaseAdminDb();

            const {
                limit: pageLimit = 10,
                status = "all",
                sortBy = "createdAt",
                sortOrder = "desc",
            } = params;

            // Build query
            let queryRef: FirebaseFirestore.Query = db.collection(ORDERS_COLLECTION).where("userId", "==", userId);

            // Add status filter if not "all"
            if (status !== "all") {
                queryRef = queryRef.where("status", "==", status);
            }

            // Try to execute the query with ordering
            try {
                let orderedQuery = queryRef.orderBy(sortBy, sortOrder as "asc" | "desc").limit(pageLimit + 1);

                const querySnapshot = await orderedQuery.get();
                const hasMore = querySnapshot.docs.length > pageLimit;
                const orders = querySnapshot.docs
                    .slice(0, pageLimit)
                    .map(convertFirestoreDocToOrder);

                return { orders, hasMore };
            } catch (error: any) {
                // Check if error is due to missing index
                if (error.message && error.message.includes("requires an index")) {
                    console.warn("Firestore index missing. Falling back to in-memory sorting. Please create the index using the link in the server logs.");

                    // Fallback: Fetch all (or a reasonable limit) and sort in memory
                    // Note: This ignores pagination for the fetch but applies it to the result
                    const querySnapshot = await queryRef.limit(100).get(); // Fetch up to 100 recent orders

                    let orders = querySnapshot.docs.map(convertFirestoreDocToOrder);

                    // Sort in memory
                    orders.sort((a: any, b: any) => {
                        const valA = a[sortBy];
                        const valB = b[sortBy];

                        if (valA instanceof Date && valB instanceof Date) {
                            return sortOrder === "desc"
                                ? valB.getTime() - valA.getTime()
                                : valA.getTime() - valB.getTime();
                        }

                        if (valA < valB) return sortOrder === "desc" ? 1 : -1;
                        if (valA > valB) return sortOrder === "desc" ? -1 : 1;
                        return 0;
                    });

                    const hasMore = orders.length > pageLimit;
                    orders = orders.slice(0, pageLimit);

                    return { orders, hasMore };
                }

                throw error;
            }
        } catch (error) {
            console.error("Error fetching user orders:", error);
            throw new Error(
                `Failed to fetch orders: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },

    /**
     * Cancel an order
     */
    async cancelOrder(
        orderId: string,
        userId: string,
        reason: string = "Cancelled by customer"
    ): Promise<Order> {
        try {
            const db = getFirebaseAdminDb();
            const orderRef = db.collection(ORDERS_COLLECTION).doc(orderId);

            const order = await db.runTransaction(async (transaction) => {
                const orderDoc = await transaction.get(orderRef);

                if (!orderDoc.exists) {
                    throw new Error("Order not found");
                }

                const orderData = orderDoc.data();
                if (!orderData) throw new Error("Order data is undefined");

                // Verify ownership
                if (orderData.userId !== userId) {
                    throw new Error("Unauthorized: Order does not belong to user");
                }

                // Check if cancellable
                if (
                    orderData.status !== OrderStatus.PENDING &&
                    orderData.status !== OrderStatus.CONFIRMED
                ) {
                    throw new Error(
                        `Order cannot be cancelled in ${orderData.status} status`
                    );
                }

                // Create status history entry
                const newStatusHistory: OrderStatusHistory = {
                    status: OrderStatus.CANCELLED,
                    timestamp: new Date(),
                    note: reason,
                    updatedBy: userId,
                };

                // Update order
                transaction.update(orderRef, {
                    status: OrderStatus.CANCELLED,
                    statusHistory: FieldValue.arrayUnion(newStatusHistory),
                    updatedAt: FieldValue.serverTimestamp(),
                });

                // Also update the summary in user's subcollection
                // Note: This might be expensive if we have to query for it.
                // For now, we'll assume the user's subcollection is just a summary and might be slightly out of sync
                // or we can query it.
                // Let's try to update it if we can find it easily.
                // Since we don't store the subcollection doc ID in the main order, we'd have to query.
                // For simplicity/performance, we might skip updating the subcollection for now,
                // or do it in a separate background trigger.
                // But to keep UI consistent, let's try to find it.
                const userOrderQuery = await db
                    .collection(USERS_COLLECTION)
                    .doc(userId)
                    .collection("orders")
                    .where("orderId", "==", orderId)
                    .limit(1)
                    .get();

                if (!userOrderQuery.empty) {
                    transaction.update(userOrderQuery.docs[0].ref, {
                        status: OrderStatus.CANCELLED,
                    });
                }

                return {
                    ...orderData,
                    id: orderId,
                    status: OrderStatus.CANCELLED,
                    statusHistory: [...orderData.statusHistory, newStatusHistory],
                };
            });

            // We need to return the full Order object, but the transaction return might be partial or raw data.
            // Let's fetch it again or construct it.
            // Actually, constructing it from the transaction result is safer/faster.
            // But convertFirestoreDocToOrder expects a DocumentSnapshot.
            // Let's just fetch it again to be sure we return the correct type.
            const updatedOrderDoc = await orderRef.get();
            const cancelledOrder = convertFirestoreDocToOrder(updatedOrderDoc);

            // Send order cancellation email (async, non-blocking)
            emailService.sendOrderCancellationEmail(cancelledOrder, reason).catch((err) => {
                console.error("Failed to send order cancellation email:", err);
            });

            return cancelledOrder;

        } catch (error) {
            console.error("Error cancelling order:", error);
            throw error; // Re-throw to be handled by API route
        }
    },

    /**
     * Get all orders (admin only)
     */
    async getAllOrders(
        params: { page?: number; limit?: number; status?: string; sortBy?: string; sortOrder?: string; search?: string } = {}
    ): Promise<{ orders: Order[]; hasMore: boolean; total: number }> {
        try {
            const db = getFirebaseAdminDb();

            const {
                limit: pageLimit = 20,
                status = "all",
                sortBy = "createdAt",
                sortOrder = "desc",
                search = "",
            } = params;

            // Build query
            let queryRef: FirebaseFirestore.Query = db.collection(ORDERS_COLLECTION);

            // Add status filter if not "all"
            if (status !== "all") {
                queryRef = queryRef.where("status", "==", status);
            }

            // Execute query with ordering
            const orderedQuery = queryRef.orderBy(sortBy, sortOrder as "asc" | "desc").limit(pageLimit + 1);
            const querySnapshot = await orderedQuery.get();

            let orders = querySnapshot.docs.map(convertFirestoreDocToOrder);

            // Apply search filter in memory (for order number or customer email)
            if (search) {
                const searchLower = search.toLowerCase();
                orders = orders.filter(order =>
                    order.orderNumber.toLowerCase().includes(searchLower) ||
                    order.customer.email.toLowerCase().includes(searchLower) ||
                    order.customer.firstName.toLowerCase().includes(searchLower) ||
                    order.customer.lastName.toLowerCase().includes(searchLower)
                );
            }

            const hasMore = orders.length > pageLimit;
            orders = orders.slice(0, pageLimit);

            // Get total count (for display purposes)
            const countSnapshot = await db.collection(ORDERS_COLLECTION).count().get();
            const total = countSnapshot.data().count;

            return { orders, hasMore, total };
        } catch (error) {
            console.error("Error fetching all orders:", error);
            throw new Error(
                `Failed to fetch orders: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },

    /**
     * Update order status (admin only)
     */
    async updateOrderStatus(
        orderId: string,
        newStatus: string,
        note?: string,
        updatedBy?: string
    ): Promise<Order> {
        try {
            const db = getFirebaseAdminDb();
            const orderRef = db.collection(ORDERS_COLLECTION).doc(orderId);

            const orderDoc = await orderRef.get();
            if (!orderDoc.exists) {
                throw new Error("Order not found");
            }

            const orderData = orderDoc.data();
            if (!orderData) throw new Error("Order data is undefined");

            // Create new status history entry with Firestore Timestamp for arrayUnion compatibility
            const statusHistoryEntry = {
                status: newStatus,
                timestamp: Timestamp.fromDate(new Date()),
                note: note || null,
                updatedBy: updatedBy || null,
            };

            // Update order
            await orderRef.update({
                status: newStatus,
                statusHistory: FieldValue.arrayUnion(statusHistoryEntry),
                updatedAt: FieldValue.serverTimestamp(),
            });

            // Also update the summary in user's subcollection if possible
            const userId = orderData.userId;
            if (userId) {
                const userOrderQuery = await db
                    .collection(USERS_COLLECTION)
                    .doc(userId)
                    .collection("orders")
                    .where("orderId", "==", orderId)
                    .limit(1)
                    .get();

                if (!userOrderQuery.empty) {
                    await userOrderQuery.docs[0].ref.update({
                        status: newStatus,
                    });
                }
            }

            // Fetch updated order
            const updatedOrderDoc = await orderRef.get();
            const updatedOrder = convertFirestoreDocToOrder(updatedOrderDoc);

            // Send order status update email (async, non-blocking)
            emailService.sendOrderStatusUpdateEmail(
                updatedOrder,
                newStatus,
                updatedOrder.trackingNumber
            ).catch((err) => {
                console.error("Failed to send order status update email:", err);
            });

            return updatedOrder;
        } catch (error) {
            console.error("Error updating order status:", error);
            throw new Error(
                `Failed to update order status: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },

    /**
     * Get order statistics (admin only)
     */
    async getOrderStatistics(): Promise<{
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
        ordersByStatus: Record<string, number>;
    }> {
        try {
            const db = getFirebaseAdminDb();
            const querySnapshot = await db.collection(ORDERS_COLLECTION).get();
            const orders = querySnapshot.docs.map(convertFirestoreDocToOrder);

            const totalOrders = orders.length;
            const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
            const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            const ordersByStatus: Record<string, number> = {};
            orders.forEach((order) => {
                ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
            });

            return {
                totalOrders,
                totalRevenue,
                averageOrderValue,
                ordersByStatus,
            };
        } catch (error) {
            console.error("Error getting order statistics:", error);
            throw new Error(
                `Failed to get order statistics: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },
};
