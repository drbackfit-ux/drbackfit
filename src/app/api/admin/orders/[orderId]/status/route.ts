import { NextRequest, NextResponse } from "next/server";
import { orderServiceServer } from "@/services/order.service.server";

/**
 * Verify admin session via cookie
 */
function verifyAdminSession(request: NextRequest): boolean {
    const sessionCookie = request.cookies.get("admin_session");
    return sessionCookie?.value === "authenticated";
}

/**
 * PUT /api/admin/orders/[orderId]/status
 * Update order status (admin only)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        // Verify admin session
        if (!verifyAdminSession(request)) {
            return NextResponse.json(
                { error: "Unauthorized: Admin access required" },
                { status: 401 }
            );
        }

        const { orderId } = await params;
        const body = await request.json();
        const { status, note } = body;

        if (!status) {
            return NextResponse.json(
                { error: "Status is required" },
                { status: 400 }
            );
        }

        // Update order status
        // Pass "Admin" as the updater since we're using static credentials
        const updatedOrder = await orderServiceServer.updateOrderStatus(
            orderId,
            status,
            note,
            "Admin"
        );

        return NextResponse.json({
            success: true,
            message: "Order status updated successfully",
            order: updatedOrder,
        });
    } catch (error) {
        console.error("Error updating order status:", error);

        if (error instanceof Error && error.message.includes("not found")) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                error: "Failed to update order status",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
