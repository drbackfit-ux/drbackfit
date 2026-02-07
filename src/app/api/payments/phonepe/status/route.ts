import { NextRequest, NextResponse } from "next/server";
import { checkPaymentStatus } from "@/services/phonepe.service";
import { getFirebaseAdminDb } from "@/lib/firebase/server";
import { OrderStatus, PaymentStatus } from "@/models/OrderStatus";
import { Timestamp } from "firebase-admin/firestore";

/**
 * GET /api/payments/phonepe/status?orderId=xxx
 * Check payment status for an order
 */
export async function GET(request: NextRequest) {
    try {
        const adminDb = getFirebaseAdminDb();
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get("orderId");

        if (!orderId) {
            return NextResponse.json(
                { error: "Missing orderId parameter" },
                { status: 400 }
            );
        }

        // First, check the order in our database
        const orderRef = adminDb.collection("orders").doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        const orderData = orderDoc.data();

        // If payment is already completed or failed, return cached status
        if (orderData?.payment?.status === PaymentStatus.COMPLETED) {
            return NextResponse.json({
                success: true,
                orderId,
                orderNumber: orderData.orderNumber,
                paymentStatus: "COMPLETED",
                orderStatus: orderData.status,
                message: "Payment completed successfully",
            });
        }

        if (orderData?.payment?.status === PaymentStatus.FAILED) {
            return NextResponse.json({
                success: false,
                orderId,
                orderNumber: orderData.orderNumber,
                paymentStatus: "FAILED",
                orderStatus: orderData.status,
                message: orderData.payment?.failureReason || "Payment failed",
            });
        }

        // For pending payments, check with PhonePe
        const statusResponse = await checkPaymentStatus(orderId);

        console.log("PhonePe Status Response:", statusResponse);

        if (statusResponse.success && statusResponse.data) {
            const { state, transactionId, responseCode } = statusResponse.data;

            // Update our database with the latest status
            const updateData: Record<string, unknown> = {
                updatedAt: Timestamp.now(),
            };

            if (state === "COMPLETED") {
                updateData.status = OrderStatus.CONFIRMED;
                updateData["payment.status"] = PaymentStatus.COMPLETED;
                updateData["payment.transactionId"] = transactionId;
                updateData["payment.completedAt"] = Timestamp.now();
            } else if (state === "FAILED") {
                updateData["payment.status"] = PaymentStatus.FAILED;
                updateData["payment.failureReason"] = responseCode || "Payment failed";
            }

            if (Object.keys(updateData).length > 1) {
                await orderRef.update(updateData);
            }

            return NextResponse.json({
                success: state === "COMPLETED",
                orderId,
                orderNumber: orderData?.orderNumber,
                paymentStatus: state,
                transactionId: transactionId || null,
                message: state === "COMPLETED"
                    ? "Payment completed successfully"
                    : state === "PENDING"
                        ? "Payment is being processed"
                        : "Payment failed",
            });
        }

        // If we couldn't get status from PhonePe, return current database status
        return NextResponse.json({
            success: false,
            orderId,
            orderNumber: orderData?.orderNumber,
            paymentStatus: "PENDING",
            orderStatus: orderData?.status,
            message: "Payment status check failed. Please try again.",
        });
    } catch (error) {
        console.error("Payment status check error:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
