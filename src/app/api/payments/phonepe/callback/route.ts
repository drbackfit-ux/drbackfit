import { NextRequest, NextResponse } from "next/server";
import { verifyCallback, decodeCallbackResponse } from "@/services/phonepe.service";
import { getFirebaseAdminDb } from "@/lib/firebase/server";
import { OrderStatus, PaymentStatus } from "@/models/OrderStatus";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/payments/phonepe/callback
 * Handles PhonePe server-to-server callback after payment
 */
export async function POST(request: NextRequest) {
    try {
        const adminDb = getFirebaseAdminDb();
        const body = await request.json();
        const { response: responseBase64 } = body;
        const xVerify = request.headers.get("X-VERIFY");

        console.log("PhonePe Callback received:", {
            hasResponse: !!responseBase64,
            hasXVerify: !!xVerify,
        });

        // Verify callback authenticity (optional but recommended)
        if (xVerify && !verifyCallback(responseBase64, xVerify)) {
            console.error("PhonePe callback verification failed");
            // Continue processing but log the warning
        }

        // Decode the response
        const callbackData = decodeCallbackResponse(responseBase64);

        if (!callbackData || !callbackData.data) {
            console.error("Failed to decode callback response");
            return NextResponse.json(
                { success: false, message: "Invalid callback data" },
                { status: 400 }
            );
        }

        const { merchantTransactionId, state, transactionId, amount, responseCode } = callbackData.data;

        console.log("PhonePe Callback Data:", {
            merchantTransactionId,
            state,
            transactionId,
            amount,
            responseCode,
        });

        // Find the order by merchantTransactionId (which is our orderId)
        const orderRef = adminDb.collection("orders").doc(merchantTransactionId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            console.error("Order not found:", merchantTransactionId);
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
            updateData["payment.transactionId"] = transactionId;
            updateData["payment.completedAt"] = Timestamp.now();
        } else if (state === "FAILED") {
            updateData["payment.status"] = PaymentStatus.FAILED;
            updateData["payment.failureReason"] = responseCode || "Payment failed";
        } else if (state === "PENDING") {
            updateData["payment.status"] = PaymentStatus.PENDING;
        }

        await orderRef.update(updateData);

        console.log("Order updated successfully:", merchantTransactionId);

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
