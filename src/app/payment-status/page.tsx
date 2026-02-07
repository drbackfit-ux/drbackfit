"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import { useCart } from "@/context/CartContext";

type PaymentStatus = "loading" | "success" | "failed" | "pending";

interface StatusResponse {
    success: boolean;
    orderId: string;
    orderNumber: string;
    paymentStatus: "COMPLETED" | "PENDING" | "FAILED";
    transactionId?: string;
    message: string;
}

function PaymentStatusContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCart();

    const orderId = searchParams.get("orderId");
    const orderNumber = searchParams.get("orderNumber");

    const [status, setStatus] = useState<PaymentStatus>("loading");
    const [statusData, setStatusData] = useState<StatusResponse | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const checkStatus = async () => {
        if (!orderId) {
            setStatus("failed");
            return;
        }

        setIsChecking(true);
        try {
            const response = await fetch(`/api/payments/phonepe/status?orderId=${orderId}`);
            const data: StatusResponse = await response.json();

            setStatusData(data);

            if (data.paymentStatus === "COMPLETED") {
                setStatus("success");
                // Clear cart on successful payment
                clearCart();
            } else if (data.paymentStatus === "FAILED") {
                setStatus("failed");
            } else {
                setStatus("pending");
            }
        } catch (error) {
            console.error("Error checking payment status:", error);
            setStatus("failed");
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        checkStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    // Polling for pending payments
    useEffect(() => {
        if (status === "pending") {
            const interval = setInterval(() => {
                checkStatus();
            }, 5000); // Check every 5 seconds

            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const handleViewOrder = () => {
        if (orderNumber) {
            router.push(`/order-confirmation?orderNumber=${orderNumber}`);
        }
    };

    const handleRetryPayment = () => {
        router.push("/checkout");
    };

    const handleGoHome = () => {
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 text-center space-y-6">
                {/* Loading State */}
                {status === "loading" && (
                    <>
                        <div className="flex justify-center">
                            <Loader2 className="h-16 w-16 text-primary animate-spin" />
                        </div>
                        <h1 className="text-2xl font-serif font-bold">
                            Verifying Payment...
                        </h1>
                        <p className="text-muted-foreground">
                            Please wait while we confirm your payment status.
                        </p>
                    </>
                )}

                {/* Success State */}
                {status === "success" && (
                    <>
                        <div className="flex justify-center">
                            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="h-12 w-12 text-green-600" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-serif font-bold text-green-600">
                            Payment Successful!
                        </h1>
                        <p className="text-muted-foreground">
                            Your order has been placed successfully.
                        </p>
                        {orderNumber && (
                            <div className="bg-secondary/30 rounded-lg p-4">
                                <p className="text-sm text-muted-foreground">Order Number</p>
                                <p className="text-lg font-semibold">{orderNumber}</p>
                            </div>
                        )}
                        {statusData?.transactionId && (
                            <p className="text-sm text-muted-foreground">
                                Transaction ID: {statusData.transactionId}
                            </p>
                        )}
                        <div className="space-y-3 pt-4">
                            <Button
                                onClick={handleViewOrder}
                                className="w-full btn-premium"
                                size="lg"
                            >
                                View Order Details
                            </Button>
                            <Button
                                onClick={handleGoHome}
                                variant="outline"
                                className="w-full"
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    </>
                )}

                {/* Failed State */}
                {status === "failed" && (
                    <>
                        <div className="flex justify-center">
                            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                                <XCircle className="h-12 w-12 text-red-600" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-serif font-bold text-red-600">
                            Payment Failed
                        </h1>
                        <p className="text-muted-foreground">
                            {statusData?.message || "Your payment could not be processed. Please try again."}
                        </p>
                        <div className="space-y-3 pt-4">
                            <Button
                                onClick={handleRetryPayment}
                                className="w-full btn-premium"
                                size="lg"
                            >
                                Try Again
                            </Button>
                            <Button
                                onClick={handleGoHome}
                                variant="outline"
                                className="w-full"
                            >
                                Go to Home
                            </Button>
                        </div>
                    </>
                )}

                {/* Pending State */}
                {status === "pending" && (
                    <>
                        <div className="flex justify-center">
                            <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center">
                                <Clock className="h-12 w-12 text-yellow-600" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-serif font-bold text-yellow-600">
                            Payment Processing
                        </h1>
                        <p className="text-muted-foreground">
                            Your payment is being processed. This may take a few moments.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Checking status...</span>
                        </div>
                        <div className="space-y-3 pt-4">
                            <Button
                                onClick={checkStatus}
                                variant="outline"
                                className="w-full"
                                disabled={isChecking}
                            >
                                {isChecking ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Refresh Status
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleGoHome}
                                variant="ghost"
                                className="w-full"
                            >
                                Go to Home
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            You can safely close this page. You will receive an email confirmation once the payment is complete.
                        </p>
                    </>
                )}
            </Card>
        </div>
    );
}

export default function PaymentStatusPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <PaymentStatusContent />
        </Suspense>
    );
}
