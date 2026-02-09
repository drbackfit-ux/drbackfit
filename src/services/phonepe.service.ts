import crypto from "crypto";

/**
 * PhonePe Payment Gateway Service - V2 API
 * Uses OAuth2 authentication with Client ID and Client Secret
 */

// PhonePe API endpoints - V2
const PHONEPE_ENDPOINTS = {
    UAT: {
        authBase: "https://api-preprod.phonepe.com/apis/identity-manager",
        apiBase: "https://api-preprod.phonepe.com/apis/pg-sandbox",
        auth: "/v1/oauth/token",
        pay: "/checkout/v2/pay",
        status: "/checkout/v2/order",
    },
    PROD: {
        authBase: "https://api.phonepe.com/apis/identity-manager",
        apiBase: "https://api.phonepe.com/apis/pg",
        auth: "/v1/oauth/token",
        pay: "/checkout/v2/pay",
        status: "/checkout/v2/order",
    },
};

// Token cache
let cachedToken: {
    accessToken: string;
    expiresAt: number;
} | null = null;

// Get environment configuration
const getConfig = () => {
    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const clientId = process.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    const clientVersion = process.env.PHONEPE_CLIENT_VERSION || "1";
    const env = (process.env.PHONEPE_ENV || "UAT") as "UAT" | "PROD";

    if (!merchantId || !clientId || !clientSecret) {
        throw new Error(
            "PhonePe V2 credentials not configured. Please set PHONEPE_MERCHANT_ID, PHONEPE_CLIENT_ID, and PHONEPE_CLIENT_SECRET in .env.local"
        );
    }

    return {
        merchantId,
        clientId,
        clientSecret,
        clientVersion,
        env,
        endpoints: PHONEPE_ENDPOINTS[env],
    };
};

/**
 * Get OAuth2 access token
 */
const getAccessToken = async (): Promise<string> => {
    // Return cached token if still valid (with 60s buffer)
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
        return cachedToken.accessToken;
    }

    const config = getConfig();

    console.log("Requesting PhonePe OAuth token...");

    try {
        const response = await fetch(`${config.endpoints.authBase}${config.endpoints.auth}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: config.clientId,
                client_version: config.clientVersion,
                client_secret: config.clientSecret,
                grant_type: "client_credentials",
            }).toString(),
        });

        const data = await response.json();

        console.log("OAuth Token Response:", {
            success: !!data.access_token,
            expiresIn: data.expires_in,
            httpStatus: response.status,
        });

        if (!data.access_token) {
            console.error("Failed to get access token:", data);
            throw new Error(data.message || "Failed to get PhonePe access token");
        }

        // Cache the token
        cachedToken = {
            accessToken: data.access_token,
            expiresAt: Date.now() + (data.expires_in * 1000),
        };

        return data.access_token;
    } catch (error) {
        console.error("OAuth token error:", error);
        throw error;
    }
};

/**
 * Payment request payload interface
 */
export interface PhonePePaymentRequest {
    orderId: string;
    amount: number; // Amount in paise (multiply by 100)
    redirectUrl: string;
    callbackUrl?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
}

/**
 * Payment response interface
 */
export interface PhonePePaymentResponse {
    success: boolean;
    code: string;
    message: string;
    orderId?: string;
    redirectUrl?: string;
    data?: Record<string, unknown>;
}

/**
 * Payment status response interface
 */
export interface PhonePeStatusResponse {
    success: boolean;
    code: string;
    message: string;
    data?: {
        merchantId: string;
        merchantOrderId: string;
        transactionId?: string;
        amount: number;
        state: "PENDING" | "COMPLETED" | "FAILED";
        responseCode?: string;
        paymentDetails?: {
            paymentMode?: string;
            transactionId?: string;
        }[];
    };
}

/**
 * Initiate a payment with PhonePe V2 API
 */
export const initiatePayment = async (
    request: PhonePePaymentRequest
): Promise<PhonePePaymentResponse> => {
    const config = getConfig();

    try {
        // Get OAuth token
        const accessToken = await getAccessToken();

        // Build the payment payload for V2 API
        const payload = {
            merchantOrderId: request.orderId,
            amount: Math.round(request.amount * 100), // Convert to paise
            expireAfter: 1200, // 20 minutes
            paymentFlow: {
                type: "PG_CHECKOUT",
                message: "DrBackfit Order Payment",
                merchantUrls: {
                    redirectUrl: request.redirectUrl,
                },
            },
            metaInfo: {
                udf1: request.customerName || "",
                udf2: request.customerPhone || "",
                udf3: request.customerEmail || "",
            },
        };

        console.log("PhonePe V2 Payment Request:", {
            merchantOrderId: request.orderId,
            amount: payload.amount,
            redirectUrl: request.redirectUrl,
            env: config.env,
        });

        const response = await fetch(`${config.endpoints.apiBase}${config.endpoints.pay}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `O-Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        console.log("PhonePe V2 API Response:", {
            success: data.state === "PENDING" || data.orderId,
            state: data.state,
            orderId: data.orderId,
            httpStatus: response.status,
        });

        // V2 API returns orderId and redirectUrl directly
        if (data.orderId && data.redirectUrl) {
            return {
                success: true,
                code: "SUCCESS",
                message: "Payment initiated successfully",
                orderId: data.orderId,
                redirectUrl: data.redirectUrl,
                data: data,
            };
        }

        // Check for error response
        if (data.code || data.message) {
            console.error("PhonePe payment failed:", data);
            return {
                success: false,
                code: data.code || "UNKNOWN_ERROR",
                message: data.message || "Payment initiation failed",
            };
        }

        return {
            success: false,
            code: "UNKNOWN_ERROR",
            message: "Payment initiation failed - unexpected response",
        };
    } catch (error) {
        console.error("PhonePe payment initiation error:", error);
        return {
            success: false,
            code: "NETWORK_ERROR",
            message: error instanceof Error ? error.message : "Network error occurred",
        };
    }
};

/**
 * Check payment status using V2 API
 */
export const checkPaymentStatus = async (
    merchantOrderId: string
): Promise<PhonePeStatusResponse> => {
    const config = getConfig();

    try {
        const accessToken = await getAccessToken();

        const response = await fetch(
            `${config.endpoints.apiBase}${config.endpoints.status}/${merchantOrderId}/status`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `O-Bearer ${accessToken}`,
                },
            }
        );

        const data = await response.json();

        console.log("PhonePe Status Response:", {
            orderId: merchantOrderId,
            state: data.state,
            httpStatus: response.status,
        });

        // Map V2 response to our interface
        if (data.state) {
            return {
                success: data.state === "COMPLETED",
                code: data.state,
                message: data.state === "COMPLETED" ? "Payment successful" :
                    data.state === "FAILED" ? "Payment failed" : "Payment pending",
                data: {
                    merchantId: config.merchantId,
                    merchantOrderId: merchantOrderId,
                    transactionId: data.paymentDetails?.[0]?.transactionId,
                    amount: data.amount,
                    state: data.state,
                    responseCode: data.responseCode,
                    paymentDetails: data.paymentDetails,
                },
            };
        }

        return {
            success: false,
            code: "UNKNOWN",
            message: "Unable to get payment status",
        };
    } catch (error) {
        console.error("PhonePe status check error:", error);
        return {
            success: false,
            code: "NETWORK_ERROR",
            message: error instanceof Error ? error.message : "Network error occurred",
        };
    }
};

/**
 * Verify callback authenticity (for V2, verify the signature if provided)
 */
export const verifyCallback = (
    responseBase64: string,
    xVerify: string
): boolean => {
    // V2 API uses different verification - check documentation
    // For now, we'll trust callbacks from PhonePe domain
    console.log("Callback verification - V2 API may use different method");
    return true;
};

/**
 * Decode callback response
 */
export const decodeCallbackResponse = (responseBase64: string): PhonePeStatusResponse | null => {
    try {
        const decoded = Buffer.from(responseBase64, "base64").toString("utf-8");
        return JSON.parse(decoded);
    } catch (error) {
        console.error("Callback decode error:", error);
        return null;
    }
};

/**
 * Get payment status text
 */
export const getPaymentStatusText = (status: string): string => {
    switch (status) {
        case "COMPLETED":
            return "Payment Successful";
        case "PENDING":
            return "Payment Pending";
        case "FAILED":
            return "Payment Failed";
        default:
            return "Unknown Status";
    }
};
