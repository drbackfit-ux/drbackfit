import { OrderStatusHistory } from "@/models/Order";
import { OrderStatusConfig } from "@/models/OrderStatus";
import { format } from "date-fns";
import { CheckCircle2, Circle } from "lucide-react";
import { Timestamp } from "firebase/firestore";

interface OrderTimelineProps {
    statusHistory: OrderStatusHistory[];
    currentStatus: string;
}

export function OrderTimeline({
    statusHistory,
    currentStatus,
}: OrderTimelineProps) {
    // Sort history by timestamp (newest first for display)
    const sortedHistory = [...statusHistory].sort((a, b) => {
        const getTime = (timestamp: Date | Timestamp | any): number => {
            if (timestamp instanceof Date) {
                return timestamp.getTime();
            } else if (timestamp && typeof timestamp.toDate === 'function') {
                return (timestamp as Timestamp).toDate().getTime();
            } else {
                return new Date(timestamp).getTime();
            }
        };

        return getTime(b.timestamp) - getTime(a.timestamp);
    });

    return (
        <div className="space-y-4">
            {sortedHistory.map((entry, index) => {
                const config = OrderStatusConfig[entry.status];
                const isLatest = index === 0;

                // Handle both Date and Timestamp types
                let timestamp: Date;
                if (entry.timestamp instanceof Date) {
                    timestamp = entry.timestamp;
                } else if (entry.timestamp && typeof (entry.timestamp as any).toDate === 'function') {
                    timestamp = (entry.timestamp as Timestamp).toDate();
                } else {
                    timestamp = new Date(entry.timestamp as any);
                }

                return (
                    <div key={index} className="flex gap-4">
                        {/* Timeline Icon */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full ${isLatest
                                        ? `${config.bgColor} ${config.color}`
                                        : "bg-secondary text-muted-foreground"
                                    }`}
                            >
                                {isLatest ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                    <Circle className="h-4 w-4" />
                                )}
                            </div>
                            {index < sortedHistory.length - 1 && (
                                <div className="w-0.5 h-full min-h-[40px] bg-border mt-2" />
                            )}
                        </div>

                        {/* Timeline Content */}
                        <div className="flex-1 pb-8">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{config.label}</span>
                                {isLatest && (
                                    <span className="text-xs text-muted-foreground">
                                        (Current)
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                                {config.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {format(timestamp, "MMM dd, yyyy 'at' h:mm a")}
                            </p>
                            {entry.note && (
                                <p className="text-sm mt-2 p-2 bg-secondary/50 rounded-md">
                                    {entry.note}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
