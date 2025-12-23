import { NextRequest, NextResponse } from "next/server";
import { userServiceServer } from "@/services/user.service.server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * DELETE /api/customers/[id]
 * Delete a customer permanently
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Customer ID is required",
                },
                { status: 400 }
            );
        }

        await userServiceServer.deleteCustomer(id);

        return NextResponse.json({
            success: true,
            message: "Customer deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting customer:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to delete customer",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/customers/[id]
 * Get a single customer by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Customer ID is required",
                },
                { status: 400 }
            );
        }

        const customer = await userServiceServer.getCustomerById(id);

        if (!customer) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Customer not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            customer,
        });
    } catch (error) {
        console.error("Error fetching customer:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch customer",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
