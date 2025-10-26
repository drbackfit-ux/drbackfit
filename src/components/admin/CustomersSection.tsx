"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Users } from "lucide-react";
import {
  CUSTOMER_METRICS,
  CUSTOMER_SEGMENTS,
  SUPPORT_TICKETS,
  SUPPORT_PRIORITY_STYLES,
} from "@/services/admin.service";

export function CustomersSection() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-blue-100/30">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-900">
          Customer Insights
        </h2>
        <p className="text-sm text-slate-600">
          Retention signals and journey health for your customer base.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {CUSTOMER_METRICS.map((metric) => {
          const Icon = metric.trendingUp ? ArrowUpRight : ArrowDownRight;
          return (
            <Card
              key={metric.label}
              className="border border-slate-100 shadow-sm"
            >
              <CardContent className="flex flex-col gap-3 py-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {metric.label}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-none text-xs",
                      metric.trendingUp
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    )}
                  >
                    <Icon className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                    {metric.change}
                  </Badge>
                </div>
                <p className="text-2xl font-semibold text-slate-900">
                  {metric.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Segmentation
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {CUSTOMER_SEGMENTS.map((segment) => (
            <div
              key={segment.segment}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">
                  {segment.segment}
                </span>
                <Badge
                  className={cn(
                    "border-none text-xs",
                    segment.trendingUp
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  )}
                >
                  {segment.change}
                </Badge>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {segment.customers.toLocaleString()}
              </p>
              <p className="text-xs text-slate-600">{segment.description}</p>
            </div>
          ))}
        </div>

        <Separator className="my-5" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Users
              className="h-9 w-9 rounded-full bg-blue-100 p-2 text-[#1e3a8a]"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Support queue health
              </p>
              <p className="text-xs text-slate-600">
                3 priority tickets need action. Team SLA at 1h 12m.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-[#1e3a8a]/30 text-[#1e3a8a]"
          >
            Manage outreach
          </Button>
        </div>

        <ScrollArea className="mt-4 h-40 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div className="space-y-3">
            {SUPPORT_TICKETS.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-start justify-between rounded-lg bg-white p-3 shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {ticket.subject}
                  </p>
                  <p className="text-xs text-slate-600">
                    {ticket.customer} · {ticket.id}
                  </p>
                </div>
                <Badge
                  className={cn(
                    "border-none text-xs",
                    SUPPORT_PRIORITY_STYLES[ticket.priority]
                  )}
                >
                  {ticket.priority}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </section>
  );
}
