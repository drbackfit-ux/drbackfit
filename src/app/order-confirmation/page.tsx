"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react";
import Link from "next/link";
import { Order } from "@/models/Order";

export default function OrderConfirmation() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get("orderNumber");
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderNumber) {
            router.push("/");
            return;
        }

        // In a real implementation, you might fetch order details here
        // For now, we'll just show the order number
        setLoading(false);
    }, [orderNumber, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!orderNumber) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    {/* Success Icon */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
                            Order Confirmed!
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Thank you for your order
                        </p>
                    </div>

                    {/* Order Details Card */}
                    <Card className="p-6 mb-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    Order Number
                                </p>
                                <p className="text-2xl font-bold font-mono text-primary">
                                    {orderNumber}
                                </p>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">Order Confirmation Sent</p>
                                        <p className="text-sm text-muted-foreground">
                                            We've sent a confirmation email with your order details.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="bg-secondary/20 rounded-lg p-4">
                                <h3 className="font-semibold mb-2">What's Next?</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-0.5">•</span>
                                        <span>
                                            You'll receive an email confirmation shortly
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-0.5">•</span>
                                        <span>
                                            We'll notify you when your order ships
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-0.5">•</span>
                                        <span>
                                            Track your order status in your account
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            asChild
                            variant="default"
                            size="lg"
                            className="flex-1 btn-premium"
                        >
                            <Link href="/account/orders">
                                View Order Details
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="flex-1"
                        >
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Continue Shopping
                            </Link>
                        </Button>
                    </div>

                    {/* Support Info */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            Need help with your order?{" "}
                            <Link
                                href="/contact"
                                className="text-primary hover:underline font-medium"
                            >
                                Contact Support
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
