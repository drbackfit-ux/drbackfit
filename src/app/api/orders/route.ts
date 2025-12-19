import { NextRequest, NextResponse } from "next/server";
import { orderServiceServer } from "@/services/order.service.server";
import { OrderCreateInputSchema, OrderQueryParamsSchema } from "@/models/Order";
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
        // Ensure app is initialized before verifying token
        const app = getFirebaseAdminApp();
        const decodedToken = await getAuth(app).verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying auth token:", error);
        return null;
    }
}

/**
 * POST /api/orders
 * Create a new order
 */
export async function POST(request: NextRequest) {
    try {
        console.log("=== Order Creation Request Started ===");

        // Ensure Firebase Admin is initialized
        try {
            getFirebaseAdminApp();
        } catch (error) {
            console.error("Firebase Admin initialization failed:", error);
            return NextResponse.json(
                {
                    error: "Server configuration error",
                    message: "Firebase Admin is not properly configured. Please check server logs.",
                    details: process.env.NODE_ENV === 'development' ? {
                        error: error instanceof Error ? error.message : String(error)
                    } : undefined
                },
                { status: 500 }
            );
        }

        // Verify authentication
        const userId = await verifyAuthToken(request);
        console.log("User ID from token:", userId);

        if (!userId) {
            console.error("Authentication failed - no user ID");
            return NextResponse.json(
                { error: "Unauthorized: Please sign in to place an order" },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();
        console.log("Request body received:", JSON.stringify(body, null, 2));

        // Validate input
        const validationResult = OrderCreateInputSchema.safeParse(body);
        if (!validationResult.success) {
            console.error("Validation failed:", validationResult.error.errors);
            return NextResponse.json(
                {
                    error: "Invalid order data",
                    details: validationResult.error.errors,
                },
                { status: 400 }
            );
        }

        console.log("Validation passed, creating order...");

        // Create order
        const order = await orderServiceServer.createOrder(userId, validationResult.data);

        console.log("Order created successfully:", order.orderNumber);

        return NextResponse.json(
            {
                success: true,
                message: "Order created successfully",
                order,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("=== Order Creation Error ===");
        console.error("Error type:", error?.constructor?.name);
        console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
        console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));

        return NextResponse.json(
            {
                error: "Failed to create order",
                message: error instanceof Error ? error.message : "Unknown error",
                details: process.env.NODE_ENV === 'development' ? {
                    type: error?.constructor?.name,
                    stack: error instanceof Error ? error.stack : undefined
                } : undefined
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/orders
 * Get user's orders with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const userId = await verifyAuthToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized: Please sign in to view orders" },
                { status: 401 }
            );
        }

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const params = {
            page: parseInt(searchParams.get("page") || "1"),
            limit: parseInt(searchParams.get("limit") || "10"),
            status: searchParams.get("status") || "all",
            sortBy: searchParams.get("sortBy") || "createdAt",
            sortOrder: searchParams.get("sortOrder") || "desc",
            search: searchParams.get("search") || undefined,
        };

        // Validate query params
        const validationResult = OrderQueryParamsSchema.safeParse(params);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Invalid query parameters",
                    details: validationResult.error.errors,
                },
                { status: 400 }
            );
        }

        // Get orders
        const { orders, hasMore } = await orderServiceServer.getUserOrders(
            userId,
            validationResult.data
        );

        return NextResponse.json({
            success: true,
            orders,
            hasMore,
            page: validationResult.data.page,
            limit: validationResult.data.limit,
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch orders",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
