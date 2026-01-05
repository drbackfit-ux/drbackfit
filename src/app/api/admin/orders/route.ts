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
 * GET /api/admin/orders
 * Get all orders with filtering and pagination (admin only)
 */
export async function GET(request: NextRequest) {
    try {
        // Verify admin session
        if (!verifyAdminSession(request)) {
            return NextResponse.json(
                { error: "Unauthorized: Admin access required" },
                { status: 401 }
            );
        }

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const params = {
            page: parseInt(searchParams.get("page") || "1"),
            limit: parseInt(searchParams.get("limit") || "20"),
            status: searchParams.get("status") || "all",
            sortBy: searchParams.get("sortBy") || "createdAt",
            sortOrder: searchParams.get("sortOrder") || "desc",
            search: searchParams.get("search") || "",
        };

        // Get orders
        const { orders, hasMore, total } = await orderServiceServer.getAllOrders(params);

        return NextResponse.json({
            success: true,
            orders,
            hasMore,
            total,
            page: params.page,
            limit: params.limit,
        });
    } catch (error) {
        console.error("Error fetching admin orders:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch orders",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/orders/statistics
 * Get order statistics for dashboard
 */
export async function POST(request: NextRequest) {
    try {
        // Verify admin session
        if (!verifyAdminSession(request)) {
            return NextResponse.json(
                { error: "Unauthorized: Admin access required" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { action } = body;

        if (action === "statistics") {
            const statistics = await orderServiceServer.getOrderStatistics();
            return NextResponse.json({
                success: true,
                statistics,
            });
        }

        return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
        );
    } catch (error) {
        console.error("Error in admin orders action:", error);
        return NextResponse.json(
            {
                error: "Failed to perform action",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
