import { OrderStatusConfig, type OrderStatusType } from "@/models/OrderStatus";
import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
    status: OrderStatusType;
    size?: "sm" | "md" | "lg";
    showIcon?: boolean;
}

export function OrderStatusBadge({
    status,
    size = "md",
    showIcon = true,
}: OrderStatusBadgeProps) {
    const config = OrderStatusConfig[status];

    const sizeClasses = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-3 py-1",
        lg: "text-base px-4 py-1.5",
    };

    return (
        <Badge
            className={`${config.bgColor} ${config.color} border-0 ${sizeClasses[size]} font-medium`}
        >
            {showIcon && <span className="mr-1">{config.icon}</span>}
            {config.label}
        </Badge>
    );
}
