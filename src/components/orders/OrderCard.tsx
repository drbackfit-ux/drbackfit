import { Order } from "@/models/Order";
import { OrderStatusConfig } from "@/models/OrderStatus";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Package, Calendar, IndianRupee, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Timestamp } from "firebase/firestore";

interface OrderCardProps {
    order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
    const statusConfig = OrderStatusConfig[order.status];

    // Handle both Date and Timestamp types
    let orderDate: Date;
    if (order.createdAt instanceof Date) {
        orderDate = order.createdAt;
    } else if (order.createdAt && typeof (order.createdAt as any).toDate === 'function') {
        orderDate = (order.createdAt as Timestamp).toDate();
    } else {
        orderDate = new Date(order.createdAt as any);
    }

    return (
        <Card className="p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm font-medium">
                            {order.orderNumber}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(orderDate, "MMM dd, yyyy")}</span>
                    </div>
                </div>
                <Badge
                    className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}
                >
                    {statusConfig.icon} {statusConfig.label}
                </Badge>
            </div>

            <Separator className="my-4" />

            {/* Order Items Preview */}
            <div className="space-y-3 mb-4">
                {order.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
                {order.items.length > 2 && (
                    <p className="text-sm text-muted-foreground">
                        +{order.items.length - 2} more item
                        {order.items.length - 2 !== 1 ? "s" : ""}
                    </p>
                )}
            </div>

            <Separator className="my-4" />

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-bold">₹{order.total.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">
                        ({order.items.reduce((sum, item) => sum + item.quantity, 0)} items)
                    </span>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href={`/account/orders/${order.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Link>
                </Button>
            </div>
        </Card>
    );
}
