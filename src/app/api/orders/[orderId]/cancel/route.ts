import { NextRequest, NextResponse } from "next/server";
import { orderServiceServer } from "@/services/order.service.server";
import { getAuth } from "firebase-admin/auth";
import { getFirebaseAdminApp } from "@/lib/firebase/server";

/**
 * Verify Firebase Auth token and get user ID
 */
async function verifyAuthToken(request: NextRequest): Promise<string | null> {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return null;
        }

        const token = authHeader.substring(7);
        const app = getFirebaseAdminApp();
        const decodedToken = await getAuth(app).verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying auth token:", error);
        return null;
    }
}

/**
 * POST /api/orders/[orderId]/cancel
 * Cancel an order
 */
export async function POST(
    request: NextRequest,
    props: { params: Promise<{ orderId: string }> }
) {
    try {
        const params = await props.params;
        const { orderId } = params;

        console.log(`[Cancel Order] Request received for order: ${orderId}`);

        // Verify authentication
        const userId = await verifyAuthToken(request);
        console.log(`[Cancel Order] User ID: ${userId}`);

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized: Please sign in to cancel order" },
                { status: 401 }
            );
        }

        // Parse request body for optional reason
        const body = await request.json().catch(() => ({}));
        const reason = body.reason || "Cancelled by customer";

        // Cancel order
        const order = await orderServiceServer.cancelOrder(orderId, userId, reason);

        return NextResponse.json({
            success: true,
            message: "Order cancelled successfully",
            order,
        });
    } catch (error) {
        console.error("Error cancelling order:", error);

        // Handle specific errors
        if (error instanceof Error) {
            if (error.message.includes("Unauthorized")) {
                return NextResponse.json(
                    { error: "Unauthorized: You cannot cancel this order" },
                    { status: 403 }
                );
            }

            if (error.message.includes("cannot be cancelled")) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 400 }
                );
            }

            if (error.message.includes("not found")) {
                return NextResponse.json(
                    { error: "Order not found" },
                    { status: 404 }
                );
            }
        }

        return NextResponse.json(
            {
                error: "Failed to cancel order",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
