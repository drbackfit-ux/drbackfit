import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    runTransaction,
} from "firebase/firestore";
import { getFirebaseClientDb } from "@/lib/firebase/client";

/**
 * Order Number Service
 * Generates unique, sequential order numbers with date-based prefixes
 * Format: ORD-YYYYMMDD-XXX (e.g., ORD-20231214-001)
 */

const ORDER_COUNTER_COLLECTION = "orderCounters";
const ORDER_COUNTER_DOC = "counter";

interface OrderCounter {
    lastNumber: number;
    lastDate: string; // YYYYMMDD format
    updatedAt: Date;
}

/**
 * Get current date in YYYYMMDD format
 */
const getCurrentDateString = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
};

/**
 * Format order number with leading zeros
 */
const formatOrderNumber = (dateStr: string, number: number): string => {
    const paddedNumber = String(number).padStart(3, "0");
    return `ORD-${dateStr}-${paddedNumber}`;
};

/**
 * Generate a unique order number
 * Uses Firestore transaction to ensure uniqueness
 */
export const generateOrderNumber = async (): Promise<string> => {
    try {
        const db = getFirebaseClientDb();
        const counterRef = doc(db, ORDER_COUNTER_COLLECTION, ORDER_COUNTER_DOC);

        const orderNumber = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            const currentDate = getCurrentDateString();

            let nextNumber = 1;

            if (counterDoc.exists()) {
                const data = counterDoc.data() as OrderCounter;
                const lastDate = data.lastDate;

                // If it's a new day, reset counter to 1
                // Otherwise, increment the counter
                if (lastDate === currentDate) {
                    nextNumber = data.lastNumber + 1;
                } else {
                    nextNumber = 1;
                }
            }

            // Update the counter
            transaction.set(counterRef, {
                lastNumber: nextNumber,
                lastDate: currentDate,
                updatedAt: new Date(),
            });

            return formatOrderNumber(currentDate, nextNumber);
        });

        console.log("Generated order number:", orderNumber);
        return orderNumber;
    } catch (error) {
        console.error("Error generating order number:", error);
        throw new Error("Failed to generate order number");
    }
};

/**
 * Initialize order counter (for first-time setup)
 */
export const initializeOrderCounter = async (): Promise<void> => {
    try {
        const db = getFirebaseClientDb();
        const counterRef = doc(db, ORDER_COUNTER_COLLECTION, ORDER_COUNTER_DOC);

        const counterDoc = await getDoc(counterRef);

        if (!counterDoc.exists()) {
            await setDoc(counterRef, {
                lastNumber: 0,
                lastDate: getCurrentDateString(),
                updatedAt: new Date(),
            });
            console.log("Order counter initialized");
        } else {
            console.log("Order counter already exists");
        }
    } catch (error) {
        console.error("Error initializing order counter:", error);
        throw new Error("Failed to initialize order counter");
    }
};

/**
 * Get current counter status (for debugging/admin)
 */
export const getOrderCounterStatus = async (): Promise<OrderCounter | null> => {
    try {
        const db = getFirebaseClientDb();
        const counterRef = doc(db, ORDER_COUNTER_COLLECTION, ORDER_COUNTER_DOC);

        const counterDoc = await getDoc(counterRef);

        if (counterDoc.exists()) {
            return counterDoc.data() as OrderCounter;
        }

        return null;
    } catch (error) {
        console.error("Error getting order counter status:", error);
        throw new Error("Failed to get order counter status");
    }
};

/**
 * Reset order counter (admin only - use with caution!)
 */
export const resetOrderCounter = async (): Promise<void> => {
    try {
        const db = getFirebaseClientDb();
        const counterRef = doc(db, ORDER_COUNTER_COLLECTION, ORDER_COUNTER_DOC);

        await updateDoc(counterRef, {
            lastNumber: 0,
            lastDate: getCurrentDateString(),
            updatedAt: new Date(),
        });

        console.log("Order counter reset");
    } catch (error) {
        console.error("Error resetting order counter:", error);
        throw new Error("Failed to reset order counter");
    }
};

/**
 * Validate order number format
 */
export const isValidOrderNumber = (orderNumber: string): boolean => {
    const pattern = /^ORD-\d{8}-\d{3}$/;
    return pattern.test(orderNumber);
};

/**
 * Extract date from order number
 */
export const extractDateFromOrderNumber = (
    orderNumber: string
): Date | null => {
    if (!isValidOrderNumber(orderNumber)) {
        return null;
    }

    const dateStr = orderNumber.split("-")[1];
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1; // Month is 0-indexed
    const day = parseInt(dateStr.substring(6, 8));

    return new Date(year, month, day);
};

/**
 * Extract sequence number from order number
 */
export const extractSequenceFromOrderNumber = (
    orderNumber: string
): number | null => {
    if (!isValidOrderNumber(orderNumber)) {
        return null;
    }

    const sequenceStr = orderNumber.split("-")[2];
    return parseInt(sequenceStr);
};
