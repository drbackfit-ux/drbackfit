import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/test-order
 * Simple test endpoint to check if order API is accessible
 */
export async function GET() {
    return NextResponse.json({
        success: true,
        message: "Order API is accessible",
        timestamp: new Date().toISOString(),
    });
}

/**
 * POST /api/test-order
 * Test order creation without actual database operations
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        return NextResponse.json({
            success: true,
            message: "Test order endpoint working",
            receivedData: {
                hasCustomer: !!body.customer,
                hasItems: !!body.items,
                itemCount: body.items?.length || 0,
                total: body.total,
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: "Test failed",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
