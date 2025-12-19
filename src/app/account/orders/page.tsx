"use client";

import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import { OrderCard } from "@/components/orders/OrderCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Package, Loader2, AlertCircle } from "lucide-react";
import { OrderStatus } from "@/models/OrderStatus";
import Link from "next/link";

export default function OrdersPage() {
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const limit = 10;

    const { orders, loading, error, hasMore } = useOrders({
        page,
        limit,
        status: statusFilter as any,
        sortBy: "createdAt",
        sortOrder: "desc",
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-secondary/20 border-b border-border">
                <div className="container mx-auto px-4 py-12">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
                        My Orders
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        View and track all your orders
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Orders</SelectItem>
                                <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
                                <SelectItem value={OrderStatus.CONFIRMED}>Confirmed</SelectItem>
                                <SelectItem value={OrderStatus.PROCESSING}>Processing</SelectItem>
                                <SelectItem value={OrderStatus.SHIPPED}>Shipped</SelectItem>
                                <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
                                <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <Card className="p-8 text-center">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Error Loading Orders</h3>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>Try Again</Button>
                    </Card>
                )}

                {/* Empty State */}
                {!loading && !error && orders.length === 0 && (
                    <Card className="p-12 text-center">
                        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-serif font-semibold mb-2">
                            No Orders Yet
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {statusFilter === "all"
                                ? "You haven't placed any orders yet. Start shopping to see your orders here!"
                                : `No orders with status: ${statusFilter}`}
                        </p>
                        <Button asChild className="btn-premium">
                            <Link href="/catalog">Start Shopping</Link>
                        </Button>
                    </Card>
                )}

                {/* Orders List */}
                {!loading && !error && orders.length > 0 && (
                    <>
                        <div className="grid gap-6 mb-8">
                            {orders.map((order) => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {(hasMore || page > 1) && (
                            <div className="flex justify-center gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-4 text-sm text-muted-foreground">
                                    Page {page}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={!hasMore}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
