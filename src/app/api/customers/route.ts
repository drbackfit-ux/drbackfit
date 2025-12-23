import { NextRequest, NextResponse } from "next/server";
import { userServiceServer } from "@/services/user.service.server";

/**
 * GET /api/customers
 * Get all customers with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const params = {
            page: parseInt(searchParams.get("page") || "1"),
            limit: parseInt(searchParams.get("limit") || "20"),
            search: searchParams.get("search") || "",
            status: (searchParams.get("status") as "all" | "active" | "inactive") || "all",
            sortBy: (searchParams.get("sortBy") as "createdAt" | "lastLoginAt" | "displayName" | "email") || "createdAt",
            sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
        };

        const result = await userServiceServer.getCustomers(params);
        const stats = await userServiceServer.getCustomerStats();

        return NextResponse.json({
            success: true,
            ...result,
            stats,
        });
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch customers",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
