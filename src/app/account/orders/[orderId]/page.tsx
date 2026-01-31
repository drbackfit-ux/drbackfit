"use client";

import { use } from "react";
import { useOrder } from "@/hooks/use-orders";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Package,
    MapPin,
    CreditCard,
    Loader2,
    AlertCircle,
    Download,
    X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { canCancelOrder } from "@/models/OrderStatus";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function OrderDetailsPage({
    params,
}: {
    params: Promise<{ orderId: string }>;
}) {
    const { orderId } = use(params);
    const { order, loading, error, refetch } = useOrder(orderId);
    const { user, firebaseUser } = useAuth();
    const router = useRouter();
    const [cancelling, setCancelling] = useState(false);

    const handleCancelOrder = async () => {
        if (!order || !user || !firebaseUser) return;

        if (!confirm("Are you sure you want to cancel this order?")) {
            return;
        }

        setCancelling(true);

        try {
            const token = await firebaseUser.getIdToken();

            const response = await fetch(`/api/orders/${orderId}/cancel`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    reason: "Cancelled by customer",
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to cancel order");
            }

            toast.success("Order cancelled successfully");
            refetch();
        } catch (err) {
            console.error("Error cancelling order:", err);
            toast.error(
                err instanceof Error ? err.message : "Failed to cancel order"
            );
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-12">
                    <Card className="p-8 text-center max-w-md mx-auto">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {error || "Order Not Found"}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {error || "The order you're looking for doesn't exist."}
                        </p>
                        <Button asChild>
                            <Link href="/account/orders">Back to Orders</Link>
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    // Handle both Date and Timestamp types
    let orderDate: Date;
    if (order.createdAt instanceof Date) {
        orderDate = order.createdAt;
    } else if (order.createdAt && typeof (order.createdAt as any).toDate === 'function') {
        orderDate = (order.createdAt as any).toDate();
    } else {
        orderDate = new Date(order.createdAt as any);
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-secondary/20 border-b border-border">
                <div className="container mx-auto px-4 py-8">
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="mb-4"
                    >
                        <Link href="/account/orders">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Orders
                        </Link>
                    </Button>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
                                Order Details
                            </h1>
                            <p className="text-lg font-mono text-muted-foreground">
                                {order.orderNumber}
                            </p>
                        </div>
                        <OrderStatusBadge status={order.status} size="lg" />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <Card className="p-6">
                            <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Order Items
                            </h2>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index}>
                                        <div className="flex gap-4">
                                            <div className="relative w-20 h-20 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                                                <Image
                                                    src={item.image}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Link
                                                    href={`/product/${item.slug}`}
                                                    className="font-medium hover:text-primary transition-colors"
                                                >
                                                    {item.title}
                                                </Link>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Quantity: {item.quantity}
                                                </p>
                                                <p className="text-sm font-medium mt-1">
                                                    ₹{item.price.toLocaleString()} each
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">
                                                    ₹{item.subtotal.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        {index < order.items.length - 1 && (
                                            <Separator className="mt-4" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Order Timeline */}
                        <Card className="p-6">
                            <h2 className="text-xl font-serif font-bold mb-6">
                                Order Timeline
                            </h2>
                            <OrderTimeline
                                statusHistory={order.statusHistory}
                                currentStatus={order.status}
                            />
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <Card className="p-6">
                            <h3 className="font-semibold mb-4">Order Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₹{order.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>
                                        {order.shipping === 0 ? "Free" : `₹${order.shipping}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span>₹{order.tax.toFixed(2)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">
                                        ₹{order.total.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </Card>

                        {/* Shipping Address */}
                        <Card className="p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Shipping Address
                            </h3>
                            <div className="text-sm space-y-1">
                                <p className="font-medium">
                                    {order.customer.firstName} {order.customer.lastName}
                                </p>
                                <p className="text-muted-foreground">
                                    {order.shippingAddress.address}
                                </p>
                                <p className="text-muted-foreground">
                                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                                    {order.shippingAddress.zipCode}
                                </p>
                                <p className="text-muted-foreground">
                                    {order.shippingAddress.country}
                                </p>
                            </div>
                        </Card>

                        {/* Payment Info */}
                        <Card className="p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Payment Information
                            </h3>
                            <div className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Method</span>
                                    <span className="capitalize">{order.payment.method}</span>
                                </div>
                                {order.payment.lastFourDigits && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Card</span>
                                        <span>•••• {order.payment.lastFourDigits}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="capitalize">{order.payment.status}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Actions */}
                        <div className="space-y-3">
                            {canCancelOrder(order.status) && (
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={handleCancelOrder}
                                    disabled={cancelling}
                                >
                                    {cancelling ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Cancelling...
                                        </>
                                    ) : (
                                        <>
                                            <X className="mr-2 h-4 w-4" />
                                            Cancel Order
                                        </>
                                    )}
                                </Button>
                            )}
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/contact">
                                    Contact Support
                                </Link>
                            </Button>
                        </div>

                        {/* Order Info */}
                        <Card className="p-4 bg-secondary/20">
                            <p className="text-xs text-muted-foreground">
                                Order placed on {format(orderDate, "MMMM dd, yyyy 'at' h:mm a")}
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
