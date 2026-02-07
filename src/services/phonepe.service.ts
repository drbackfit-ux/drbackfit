import crypto from "crypto";

/**
 * PhonePe Payment Gateway Service
 * Handles payment initiation, status check, and callback verification
 */

// PhonePe API endpoints
const PHONEPE_ENDPOINTS = {
    UAT: {
        base: "https://api-preprod.phonepe.com/apis/pg-sandbox",
        pay: "/pg/v1/pay",
        status: "/pg/v1/status",
        refund: "/pg/v1/refund",
    },
    PROD: {
        base: "https://api.phonepe.com/apis/hermes",
        pay: "/pg/v1/pay",
        status: "/pg/v1/status",
        refund: "/pg/v1/refund",
    },
};

// Get environment configuration
const getConfig = () => {
    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
    const env = (process.env.PHONEPE_ENV || "UAT") as "UAT" | "PROD";

    if (!merchantId || !saltKey) {
        throw new Error("PhonePe credentials not configured. Please set PHONEPE_MERCHANT_ID and PHONEPE_SALT_KEY in .env.local");
    }

    return {
        merchantId,
        saltKey,
        saltIndex,
        env,
        endpoints: PHONEPE_ENDPOINTS[env],
    };
};

/**
 * Generate SHA256 hash
 */
const generateSha256 = (data: string): string => {
    return crypto.createHash("sha256").update(data).digest("hex");
};

/**
 * Generate X-VERIFY checksum for PhonePe API
 */
const generateChecksum = (payload: string, endpoint: string): string => {
    const config = getConfig();
    const base64Payload = Buffer.from(payload).toString("base64");
    const checksumString = base64Payload + endpoint + config.saltKey;
    const checksum = generateSha256(checksumString) + "###" + config.saltIndex;
    return checksum;
};

/**
 * Payment request payload interface
 */
export interface PhonePePaymentRequest {
    orderId: string;
    amount: number; // Amount in paise (multiply by 100)
    redirectUrl: string;
    callbackUrl: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
}

/**
 * Payment response interface
 */
export interface PhonePePaymentResponse {
    success: boolean;
    code: string;
    message: string;
    data?: {
        merchantId: string;
        merchantTransactionId: string;
        instrumentResponse?: {
            type: string;
            redirectInfo?: {
                url: string;
                method: string;
            };
        };
    };
    redirectUrl?: string;
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
        merchantTransactionId: string;
        transactionId: string;
        amount: number;
        state: "PENDING" | "COMPLETED" | "FAILED";
        responseCode: string;
        paymentInstrument?: {
            type: string;
            utr?: string;
            cardNetwork?: string;
            accountType?: string;
        };
    };
}

/**
 * Initiate a payment with PhonePe
 */
export const initiatePayment = async (
    request: PhonePePaymentRequest
): Promise<PhonePePaymentResponse> => {
    const config = getConfig();

    // Build the payment payload
    const payload = {
        merchantId: config.merchantId,
        merchantTransactionId: request.orderId,
        merchantUserId: `MUID_${request.orderId}`,
        amount: Math.round(request.amount * 100), // Convert to paise
        redirectUrl: request.redirectUrl,
        redirectMode: "REDIRECT",
        callbackUrl: request.callbackUrl,
        mobileNumber: request.customerPhone,
        paymentInstrument: {
            type: "PAY_PAGE",
        },
    };

    const payloadString = JSON.stringify(payload);
    const base64Payload = Buffer.from(payloadString).toString("base64");
    const checksum = generateChecksum(payloadString, config.endpoints.pay);

    try {
        const response = await fetch(`${config.endpoints.base}${config.endpoints.pay}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-VERIFY": checksum,
            },
            body: JSON.stringify({
                request: base64Payload,
            }),
        });

        const data = await response.json();

        if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
            return {
                success: true,
                code: data.code,
                message: data.message,
                data: data.data,
                redirectUrl: data.data.instrumentResponse.redirectInfo.url,
            };
        }

        return {
            success: false,
            code: data.code || "UNKNOWN_ERROR",
            message: data.message || "Payment initiation failed",
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
 * Check payment status
 */
export const checkPaymentStatus = async (
    merchantTransactionId: string
): Promise<PhonePeStatusResponse> => {
    const config = getConfig();
    const statusEndpoint = `${config.endpoints.status}/${config.merchantId}/${merchantTransactionId}`;

    // Generate checksum for status check
    const checksumString = statusEndpoint + config.saltKey;
    const checksum = generateSha256(checksumString) + "###" + config.saltIndex;

    try {
        const response = await fetch(`${config.endpoints.base}${statusEndpoint}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-VERIFY": checksum,
                "X-MERCHANT-ID": config.merchantId,
            },
        });

        const data = await response.json();
        return data;
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
 * Verify callback authenticity
 */
export const verifyCallback = (
    responseBase64: string,
    xVerify: string
): boolean => {
    const config = getConfig();

    try {
        // Calculate expected checksum
        const checksumString = responseBase64 + config.saltKey;
        const expectedChecksum = generateSha256(checksumString) + "###" + config.saltIndex;

        return expectedChecksum === xVerify;
    } catch (error) {
        console.error("Callback verification error:", error);
        return false;
    }
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
