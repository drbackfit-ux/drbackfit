"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  Printer,
  Search,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_METRICS,
  ORDERS,
  ORDER_STATUS_BADGE,
  type OrderStatus,
  type OrderRow,
} from "@/services/admin.service";

export function OrdersSection() {
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    OrderStatus | "All"
  >("All");
  const [orderChannelFilter, setOrderChannelFilter] = useState<
    "All" | OrderRow["channel"]
  >("All");
  const [orderSearchTerm, setOrderSearchTerm] = useState("");

  const filteredOrders = useMemo(() => {
    const term = orderSearchTerm.trim().toLowerCase();
    return ORDERS.filter((order) => {
      const matchesStatus =
        orderStatusFilter === "All" || order.status === orderStatusFilter;
      const matchesChannel =
        orderChannelFilter === "All" || order.channel === orderChannelFilter;
      const matchesTerm =
        term.length === 0 ||
        order.orderId.toLowerCase().includes(term) ||
        order.customer.toLowerCase().includes(term);
      return matchesStatus && matchesChannel && matchesTerm;
    });
  }, [orderStatusFilter, orderChannelFilter, orderSearchTerm]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-blue-100/30">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Orders</h2>
          <p className="text-sm text-slate-600">
            Track pipeline health and manage fulfillment.
          </p>
        </div>
        <Button
          variant="ghost"
          className="h-9 rounded-full border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
        >
          <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
          Advanced filters
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {ORDER_STATUS_METRICS.map((metric) => {
          const isPositive = metric.delta >= 0;
          const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
          return (
            <Card
              key={metric.status}
              className="border border-slate-100 shadow-sm"
            >
              <CardContent className="flex items-center justify-between gap-3 py-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {metric.status}
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {metric.count}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                    isPositive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  )}
                >
                  <Icon className="mr-1 h-4 w-4" aria-hidden="true" />
                  {metric.delta > 0 ? `+${metric.delta}` : metric.delta}
                  <span className="ml-1 text-[10px] uppercase tracking-wide text-slate-500">
                    week
                  </span>
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 space-y-4 rounded-2xl border border-slate-100 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Input
                value={orderSearchTerm}
                onChange={(event) => setOrderSearchTerm(event.target.value)}
                placeholder="Search orders or customers"
                className="pl-9"
              />
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </div>
            <Select
              value={orderStatusFilter}
              onValueChange={(value) =>
                setOrderStatusFilter(value as OrderStatus | "All")
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={orderChannelFilter}
              onValueChange={(value) =>
                setOrderChannelFilter(value as "All" | OrderRow["channel"])
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All channels</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Showroom">Showroom</SelectItem>
                <SelectItem value="Wholesale">Wholesale</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-[#1e3a8a]/40 text-[#1e3a8a]"
            >
              <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
              Update status
            </Button>
            <Button
              variant="outline"
              className="border-slate-200 text-slate-700"
            >
              <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
              Print docs
            </Button>
          </div>
        </div>
        <div className="rounded-xl border border-slate-100">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell className="font-medium text-slate-900">
                    {order.orderId}
                  </TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.channel}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                        ORDER_STATUS_BADGE[order.status]
                      )}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>{order.fulfillmentEta}</TableCell>
                  <TableCell className="text-right font-medium text-slate-900">
                    {order.total}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          Logistics API hooks ready for FedEx and DHL rate shopping. Connect
          credentials to enable live label purchasing directly from this view.
        </div>
      </div>
    </section>
  );
}
