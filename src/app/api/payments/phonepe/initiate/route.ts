import { NextRequest, NextResponse } from "next/server";
import { initiatePayment } from "@/services/phonepe.service";
import { getFirebaseAdminApp, getFirebaseAdminDb } from "@/lib/firebase/server";
import { getAuth } from "firebase-admin/auth";
import { OrderStatus, PaymentStatus, PaymentMethod } from "@/models/OrderStatus";
import { Timestamp } from "firebase-admin/firestore";
import { OrderCreateInput, OrderCreateInputSchema } from "@/models/Order";

/**
 * Generate order number in format: DBF-YYYYMMDD-XXXXX
 */
function generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `DBF-${year}${month}${day}-${random}`;
}

/**
 * POST /api/payments/phonepe/initiate
 * Initiates a PhonePe payment for an order
 */
export async function POST(request: NextRequest) {
    try {
        // Ensure Firebase Admin is initialized
        const app = getFirebaseAdminApp();
        const adminDb = getFirebaseAdminDb();

        // Verify authentication
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await getAuth(app).verifyIdToken(token);
        const userId = decodedToken.uid;

        // Parse request body
        const body = await request.json();
        const { orderData } = body as { orderData: OrderCreateInput };

        if (!orderData) {
            return NextResponse.json(
                { error: "Missing order data" },
                { status: 400 }
            );
        }

        // Validate order data
        const validationResult = OrderCreateInputSchema.safeParse(orderData);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Invalid order data",
                    details: validationResult.error.errors,
                },
                { status: 400 }
            );
        }

        // Generate order number
        const orderNumber = generateOrderNumber();
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Get base URL for redirects
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const redirectUrl = `${baseUrl}/payment-status?orderId=${orderId}&orderNumber=${orderNumber}`;
        const callbackUrl = `${baseUrl}/api/payments/phonepe/callback`;

        // Create order in Firestore with pending status
        const orderDoc = {
            id: orderId,
            orderNumber,
            userId,
            customer: orderData.customer,
            shippingAddress: orderData.shippingAddress,
            items: orderData.items,
            subtotal: orderData.subtotal,
            tax: orderData.tax,
            shipping: orderData.shipping,
            total: orderData.total,
            status: OrderStatus.PENDING,
            payment: {
                method: PaymentMethod.PHONEPE,
                status: PaymentStatus.PENDING,
                transactionId: null,
            },
            statusHistory: [
                {
                    status: OrderStatus.PENDING,
                    timestamp: Timestamp.now(),
                    note: "Order created, awaiting payment",
                },
            ],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        // Save order to Firestore
        await adminDb.collection("orders").doc(orderId).set(orderDoc);

        console.log("Order created for PhonePe payment:", orderId, orderNumber);

        // Initiate PhonePe payment
        const paymentResponse = await initiatePayment({
            orderId: orderId,
            amount: orderData.total,
            redirectUrl,
            callbackUrl,
            customerName: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
            customerPhone: orderData.customer.phone,
            customerEmail: orderData.customer.email,
        });

        if (!paymentResponse.success || !paymentResponse.redirectUrl) {
            // Update order status to failed
            await adminDb.collection("orders").doc(orderId).update({
                "payment.status": PaymentStatus.FAILED,
                "payment.failureReason": paymentResponse.message,
                updatedAt: Timestamp.now(),
            });

            return NextResponse.json(
                {
                    success: false,
                    error: "Payment initiation failed",
                    message: paymentResponse.message,
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            orderId,
            orderNumber,
            redirectUrl: paymentResponse.redirectUrl,
            message: "Payment initiated successfully",
        });
    } catch (error) {
        console.error("Payment initiation error:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
