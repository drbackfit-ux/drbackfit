import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
    DocumentData,
    QueryDocumentSnapshot,
} from "firebase/firestore";
import { getFirebaseClientDb } from "@/lib/firebase/client";
import {
    Order,
    OrderCreateInput,
    OrderUpdateInput,
    OrderSummary,
    OrderQueryParams,
    OrderSchema,
    OrderStatusHistory,
} from "@/models/Order";
import {
    OrderStatus,
    PaymentStatus,
    type OrderStatusType,
    canCancelOrder,
} from "@/models/OrderStatus";
import { generateOrderNumber } from "./orderNumber.service";

const ORDERS_COLLECTION = "orders";
const USERS_COLLECTION = "users";

/**
 * Convert Firestore document to Order type
 */
const convertFirestoreDocToOrder = (
    doc: QueryDocumentSnapshot<DocumentData>
): Order => {
    const data = doc.data();

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
 * Convert Order to OrderSummary
 */
const convertOrderToSummary = (order: Order): OrderSummary => {
    return {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        createdAt: order.createdAt,
        thumbnailImage: order.items[0]?.image || "",
    };
};

/**
 * Order Service
 * Handles all order-related operations
 */
export const orderService = {
    /**
     * Create a new order
     */
    async createOrder(
        userId: string,
        orderInput: OrderCreateInput
    ): Promise<Order> {
        try {
            const db = getFirebaseClientDb();

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
                    lastFourDigits: orderInput.payment.lastFourDigits,
                },
                status: OrderStatus.PENDING,
                statusHistory: [initialStatusHistory],
                notes: orderInput.notes,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            // Create order in Firestore
            const ordersRef = collection(db, ORDERS_COLLECTION);
            const orderDocRef = await addDoc(ordersRef, orderData);

            // Also create a summary in user's subcollection for quick queries
            await addDoc(collection(db, USERS_COLLECTION, userId, "orders"), {
                orderId: orderDocRef.id,
                orderNumber,
                total: orderInput.total,
                status: OrderStatus.PENDING,
                itemCount: orderInput.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                ),
                thumbnailImage: orderInput.items[0]?.image || "",
                createdAt: serverTimestamp(),
            });

            // Fetch the created order
            const createdOrderDoc = await getDoc(orderDocRef);
            if (!createdOrderDoc.exists()) {
                throw new Error("Failed to retrieve created order");
            }

            const order = convertFirestoreDocToOrder(
                createdOrderDoc as QueryDocumentSnapshot<DocumentData>
            );

            console.log("Order created successfully:", order.orderNumber);
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
            const db = getFirebaseClientDb();
            const orderRef = doc(db, ORDERS_COLLECTION, orderId);
            const orderDoc = await getDoc(orderRef);

            if (!orderDoc.exists()) {
                return null;
            }

            const order = convertFirestoreDocToOrder(
                orderDoc as QueryDocumentSnapshot<DocumentData>
            );

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
            const db = getFirebaseClientDb();
            const ordersRef = collection(db, ORDERS_COLLECTION);
            const q = query(ordersRef, where("orderNumber", "==", orderNumber));

            const querySnapshot = await getDocs(q);

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
        params: Partial<OrderQueryParams> = {}
    ): Promise<{ orders: Order[]; hasMore: boolean }> {
        try {
            const db = getFirebaseClientDb();
            const ordersRef = collection(db, ORDERS_COLLECTION);

            const {
                page = 1,
                limit: pageLimit = 10,
                status = "all",
                sortBy = "createdAt",
                sortOrder = "desc",
            } = params;

            // Build query
            let q = query(
                ordersRef,
                where("userId", "==", userId),
                orderBy(sortBy, sortOrder),
                limit(pageLimit + 1) // Fetch one extra to check if there are more
            );

            // Add status filter if not "all"
            if (status !== "all") {
                q = query(
                    ordersRef,
                    where("userId", "==", userId),
                    where("status", "==", status),
                    orderBy(sortBy, sortOrder),
                    limit(pageLimit + 1)
                );
            }

            const querySnapshot = await getDocs(q);
            const hasMore = querySnapshot.docs.length > pageLimit;
            const orders = querySnapshot.docs
                .slice(0, pageLimit)
                .map(convertFirestoreDocToOrder);

            return { orders, hasMore };
        } catch (error) {
            console.error("Error fetching user orders:", error);
            throw new Error(
                `Failed to fetch orders: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },

    /**
     * Get all orders (admin only)
     */
    async getAllOrders(
        params: Partial<OrderQueryParams> = {}
    ): Promise<{ orders: Order[]; hasMore: boolean }> {
        try {
            const db = getFirebaseClientDb();
            const ordersRef = collection(db, ORDERS_COLLECTION);

            const {
                page = 1,
                limit: pageLimit = 20,
                status = "all",
                sortBy = "createdAt",
                sortOrder = "desc",
            } = params;

            // Build query
            let q = query(
                ordersRef,
                orderBy(sortBy, sortOrder),
                limit(pageLimit + 1)
            );

            // Add status filter if not "all"
            if (status !== "all") {
                q = query(
                    ordersRef,
                    where("status", "==", status),
                    orderBy(sortBy, sortOrder),
                    limit(pageLimit + 1)
                );
            }

            const querySnapshot = await getDocs(q);
            const hasMore = querySnapshot.docs.length > pageLimit;
            const orders = querySnapshot.docs
                .slice(0, pageLimit)
                .map(convertFirestoreDocToOrder);

            return { orders, hasMore };
        } catch (error) {
            console.error("Error fetching all orders:", error);
            throw new Error(
                `Failed to fetch orders: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },

    /**
     * Update order status
     */
    async updateOrderStatus(
        orderId: string,
        newStatus: OrderStatusType,
        note?: string,
        updatedBy?: string
    ): Promise<Order> {
        try {
            const db = getFirebaseClientDb();
            const orderRef = doc(db, ORDERS_COLLECTION, orderId);

            // Get current order
            const orderDoc = await getDoc(orderRef);
            if (!orderDoc.exists()) {
                throw new Error("Order not found");
            }

            const currentOrder = convertFirestoreDocToOrder(
                orderDoc as QueryDocumentSnapshot<DocumentData>
            );

            // Create new status history entry
            const statusHistoryEntry: OrderStatusHistory = {
                status: newStatus,
                timestamp: new Date(),
                note,
                updatedBy,
            };

            // Update order
            await updateDoc(orderRef, {
                status: newStatus,
                statusHistory: [...currentOrder.statusHistory, statusHistoryEntry],
                updatedAt: serverTimestamp(),
            });

            // Fetch updated order
            const updatedOrderDoc = await getDoc(orderRef);
            return convertFirestoreDocToOrder(
                updatedOrderDoc as QueryDocumentSnapshot<DocumentData>
            );
        } catch (error) {
            console.error("Error updating order status:", error);
            throw new Error(
                `Failed to update order status: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },

    /**
     * Update order details
     */
    async updateOrder(
        orderId: string,
        updates: OrderUpdateInput
    ): Promise<Order> {
        try {
            const db = getFirebaseClientDb();
            const orderRef = doc(db, ORDERS_COLLECTION, orderId);

            // Prepare update data
            const updateData: any = {
                ...updates,
                updatedAt: serverTimestamp(),
            };

            // If status is being updated, add to history
            if (updates.status) {
                const orderDoc = await getDoc(orderRef);
                if (!orderDoc.exists()) {
                    throw new Error("Order not found");
                }

                const currentOrder = convertFirestoreDocToOrder(
                    orderDoc as QueryDocumentSnapshot<DocumentData>
                );

                const statusHistoryEntry: OrderStatusHistory = {
                    status: updates.status,
                    timestamp: new Date(),
                    note: updates.statusNote,
                };

                updateData.statusHistory = [
                    ...currentOrder.statusHistory,
                    statusHistoryEntry,
                ];
            }

            // Remove statusNote from update data as it's only for history
            delete updateData.statusNote;

            await updateDoc(orderRef, updateData);

            // Fetch updated order
            const updatedOrderDoc = await getDoc(orderRef);
            return convertFirestoreDocToOrder(
                updatedOrderDoc as QueryDocumentSnapshot<DocumentData>
            );
        } catch (error) {
            console.error("Error updating order:", error);
            throw new Error(
                `Failed to update order: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },

    /**
     * Cancel order
     */
    async cancelOrder(
        orderId: string,
        userId: string,
        reason?: string
    ): Promise<Order> {
        try {
            const db = getFirebaseClientDb();
            const orderRef = doc(db, ORDERS_COLLECTION, orderId);

            // Get current order
            const orderDoc = await getDoc(orderRef);
            if (!orderDoc.exists()) {
                throw new Error("Order not found");
            }

            const order = convertFirestoreDocToOrder(
                orderDoc as QueryDocumentSnapshot<DocumentData>
            );

            // Verify ownership
            if (order.userId !== userId) {
                throw new Error("Unauthorized: Cannot cancel this order");
            }

            // Check if order can be cancelled
            if (!canCancelOrder(order.status)) {
                throw new Error(
                    `Order cannot be cancelled in ${order.status} status`
                );
            }

            // Update to cancelled status
            return await this.updateOrderStatus(
                orderId,
                OrderStatus.CANCELLED,
                reason || "Cancelled by customer",
                userId
            );
        } catch (error) {
            console.error("Error cancelling order:", error);
            throw new Error(
                `Failed to cancel order: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },

    /**
     * Search orders by order number or customer email
     */
    async searchOrders(
        searchTerm: string,
        userId?: string
    ): Promise<Order[]> {
        try {
            const db = getFirebaseClientDb();
            const ordersRef = collection(db, ORDERS_COLLECTION);

            // Search by order number
            let q = query(ordersRef, where("orderNumber", "==", searchTerm.toUpperCase()));

            if (userId) {
                q = query(
                    ordersRef,
                    where("userId", "==", userId),
                    where("orderNumber", "==", searchTerm.toUpperCase())
                );
            }

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(convertFirestoreDocToOrder);
        } catch (error) {
            console.error("Error searching orders:", error);
            throw new Error(
                `Failed to search orders: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },

    /**
     * Get order statistics (admin)
     */
    async getOrderStatistics(): Promise<{
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
        ordersByStatus: Record<string, number>;
    }> {
        try {
            const db = getFirebaseClientDb();
            const ordersRef = collection(db, ORDERS_COLLECTION);

            const querySnapshot = await getDocs(ordersRef);
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
