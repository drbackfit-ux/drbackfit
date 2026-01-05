import "server-only";

import { getFirebaseAdminDb } from "@/lib/firebase/server";
import { FieldValue } from "firebase-admin/firestore";
import { Order } from "@/models/Order";
import {
    generateOrderConfirmationEmail,
    generateOrderCancellationEmail,
    generateOrderStatusUpdateEmail,
} from "@/templates/email/orderEmailTemplates";

const MAIL_COLLECTION = "mail";

/**
 * Email data structure for Firebase Trigger Email extension
 */
interface EmailDocument {
    to: string | string[];
    message: {
        subject: string;
        html: string;
        text?: string;
    };
    createdAt: FirebaseFirestore.FieldValue;
}

/**
 * Email Service
 * Adds email documents to the 'mail' collection for Firebase Trigger Email extension
 */
export const emailService = {
    /**
     * Queue an email to be sent via Firebase Trigger Email extension
     * @returns The ID of the created mail document
     */
    async queueEmail(
        to: string | string[],
        subject: string,
        html: string,
        text?: string
    ): Promise<string> {
        try {
            const db = getFirebaseAdminDb();

            const emailDoc: EmailDocument = {
                to,
                message: {
                    subject,
                    html,
                    ...(text && { text }),
                },
                createdAt: FieldValue.serverTimestamp(),
            };

            const docRef = await db.collection(MAIL_COLLECTION).add(emailDoc);
            console.log(`Email queued successfully with ID: ${docRef.id}`);
            return docRef.id;
        } catch (error) {
            console.error("Error queuing email:", error);
            throw new Error(
                `Failed to queue email: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },

    /**
     * Send order confirmation email
     * @returns The ID of the created mail document, or null if no email was sent
     */
    async sendOrderConfirmationEmail(order: Order): Promise<string | null> {
        // Check if customer has an email
        if (!order.customer.email || order.customer.email.trim() === "") {
            console.warn(
                `No email found for order ${order.orderNumber}. Skipping confirmation email.`
            );
            return null;
        }

        try {
            const { html, text, subject } = generateOrderConfirmationEmail(order);
            const mailId = await this.queueEmail(
                order.customer.email,
                subject,
                html,
                text
            );
            console.log(
                `Order confirmation email queued for order ${order.orderNumber}`
            );
            return mailId;
        } catch (error) {
            console.error(
                `Failed to send order confirmation email for order ${order.orderNumber}:`,
                error
            );
            // Don't throw - email failure shouldn't block order creation
            return null;
        }
    },

    /**
     * Send order cancellation email
     * @returns The ID of the created mail document, or null if no email was sent
     */
    async sendOrderCancellationEmail(
        order: Order,
        reason?: string
    ): Promise<string | null> {
        // Check if customer has an email
        if (!order.customer.email || order.customer.email.trim() === "") {
            console.warn(
                `No email found for order ${order.orderNumber}. Skipping cancellation email.`
            );
            return null;
        }

        try {
            const { html, text, subject } = generateOrderCancellationEmail(
                order,
                reason
            );
            const mailId = await this.queueEmail(
                order.customer.email,
                subject,
                html,
                text
            );
            console.log(
                `Order cancellation email queued for order ${order.orderNumber}`
            );
            return mailId;
        } catch (error) {
            console.error(
                `Failed to send order cancellation email for order ${order.orderNumber}:`,
                error
            );
            // Don't throw - email failure shouldn't block order cancellation
            return null;
        }
    },

    /**
     * Send order status update email
     * @returns The ID of the created mail document, or null if no email was sent
     */
    async sendOrderStatusUpdateEmail(
        order: Order,
        newStatus: string,
        trackingNumber?: string
    ): Promise<string | null> {
        // Check if customer has an email
        if (!order.customer.email || order.customer.email.trim() === "") {
            console.warn(
                `No email found for order ${order.orderNumber}. Skipping status update email.`
            );
            return null;
        }

        // Skip email for certain status changes that might be too noisy
        const skipStatuses = ["pending"]; // Don't email for pending (initial state)
        if (skipStatuses.includes(newStatus.toLowerCase())) {
            console.log(
                `Skipping email for status "${newStatus}" on order ${order.orderNumber}`
            );
            return null;
        }

        try {
            const { html, text, subject } = generateOrderStatusUpdateEmail(
                order,
                newStatus,
                trackingNumber
            );
            const mailId = await this.queueEmail(
                order.customer.email,
                subject,
                html,
                text
            );
            console.log(
                `Order status update email queued for order ${order.orderNumber} (status: ${newStatus})`
            );
            return mailId;
        } catch (error) {
            console.error(
                `Failed to send order status update email for order ${order.orderNumber}:`,
                error
            );
            // Don't throw - email failure shouldn't block status update
            return null;
        }
    },

    /**
     * Check email delivery status
     * @returns The delivery status of the email
     */
    async getEmailStatus(
        mailId: string
    ): Promise<{
        state: string;
        error?: string;
        attempts?: number;
    } | null> {
        try {
            const db = getFirebaseAdminDb();
            const mailDoc = await db.collection(MAIL_COLLECTION).doc(mailId).get();

            if (!mailDoc.exists) {
                return null;
            }

            const data = mailDoc.data();
            if (!data?.delivery) {
                return { state: "PENDING" };
            }

            return {
                state: data.delivery.state || "UNKNOWN",
                error: data.delivery.error || undefined,
                attempts: data.delivery.attempts || 0,
            };
        } catch (error) {
            console.error("Error fetching email status:", error);
            return null;
        }
    },
};
