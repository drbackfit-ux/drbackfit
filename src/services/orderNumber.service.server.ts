import "server-only";
import { getFirebaseAdminDb } from "@/lib/firebase/server";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Order Number Service (Server-Side)
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
        const db = getFirebaseAdminDb();
        const counterRef = db.collection(ORDER_COUNTER_COLLECTION).doc(ORDER_COUNTER_DOC);

        const orderNumber = await db.runTransaction(async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            const currentDate = getCurrentDateString();

            let nextNumber = 1;

            if (counterDoc.exists) {
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
                updatedAt: FieldValue.serverTimestamp(),
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
