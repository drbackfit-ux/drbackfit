import { NextRequest, NextResponse } from "next/server";
import { checkPaymentStatus } from "@/services/phonepe.service";
import { getFirebaseAdminDb } from "@/lib/firebase/server";
import { OrderStatus, PaymentStatus } from "@/models/OrderStatus";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/payments/phonepe/callback
 * Handles PhonePe server-to-server callback after payment (V2 API)
 */
export async function POST(request: NextRequest) {
    try {
        const adminDb = getFirebaseAdminDb();
        const body = await request.json();

        console.log("PhonePe V2 Callback received:", {
            body: JSON.stringify(body),
        });

        // V2 API sends callback with merchantOrderId, state, transactionId
        const {
            merchantOrderId,
            state,
            transactionId,
            amount,
            paymentDetails
        } = body;

        if (!merchantOrderId) {
            console.error("Missing merchantOrderId in callback");
            return NextResponse.json(
                { success: false, message: "Invalid callback data - missing merchantOrderId" },
                { status: 400 }
            );
        }

        console.log("PhonePe V2 Callback Data:", {
            merchantOrderId,
            state,
            transactionId,
            amount,
        });

        // Find the order by merchantOrderId (which is our orderId)
        const orderRef = adminDb.collection("orders").doc(merchantOrderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            console.error("Order not found:", merchantOrderId);
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            );
        }

        // Update order based on payment state
        const updateData: Record<string, unknown> = {
            updatedAt: Timestamp.now(),
        };

        if (state === "COMPLETED") {
            updateData.status = OrderStatus.CONFIRMED;
            updateData["payment.status"] = PaymentStatus.COMPLETED;
            updateData["payment.transactionId"] = transactionId || paymentDetails?.[0]?.transactionId;
            updateData["payment.completedAt"] = Timestamp.now();
        } else if (state === "FAILED") {
            updateData["payment.status"] = PaymentStatus.FAILED;
            updateData["payment.failureReason"] = body.responseCode || "Payment failed";
        } else if (state === "PENDING") {
            updateData["payment.status"] = PaymentStatus.PENDING;
        }

        await orderRef.update(updateData);

        console.log("Order updated successfully:", merchantOrderId);

        return NextResponse.json({
            success: true,
            message: "Callback processed successfully",
        });
    } catch (error) {
        console.error("PhonePe callback error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Callback processing failed",
            },
            { status: 500 }
        );
    }
}
