import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/services/order.service";
import { getAuth } from "firebase-admin/auth";

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
        const decodedToken = await getAuth().verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying auth token:", error);
        return null;
    }
}

/**
 * GET /api/orders/[orderId]
 * Get order details by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        // Verify authentication
        const userId = await verifyAuthToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorize: Please sign in to view order details" },
                { status: 401 }
            );
        }

        const { orderId } = await params;

        // Get order
        const order = await orderService.getOrderById(orderId, userId);

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("Error fetching order:", error);

        // Handle unauthorized access
        if (
            error instanceof Error &&
            error.message.includes("Unauthorized")
        ) {
            return NextResponse.json(
                { error: "Unauthorized: You do not have access to this order" },
                { status: 403 }
            );
        }

        return NextResponse.json(
            {
                error: "Failed to fetch order",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
