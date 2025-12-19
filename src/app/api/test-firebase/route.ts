import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Initialize Firebase Admin
if (!getApps().length) {
    try {
        initializeApp({
            credential: cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            }),
        });
    } catch (error) {
        console.error("Firebase Admin initialization error:", error);
    }
}

/**
 * GET /api/test-firebase
 * Test Firebase Admin configuration
 */
export async function GET() {
    try {
        const config = {
            hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
            hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.substring(0, 20) + "...",
            appsInitialized: getApps().length,
        };

        return NextResponse.json({
            success: true,
            message: "Firebase Admin configuration check",
            config,
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: "Configuration check failed",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
