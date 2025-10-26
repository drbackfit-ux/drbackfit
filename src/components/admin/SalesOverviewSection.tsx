"use client";

import { useMemo, useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SalesSnapshot = {
  label: string;
  value: string;
  change: string;
  trendingUp: boolean;
};

type SimpleSparkPoint = {
  label: string;
  value: number;
};

type SalesTrendPoint = {
  day: string;
  revenue: number;
  orders: number;
};

const SALES_SNAPSHOTS: SalesSnapshot[] = [
  { label: "Today", value: "$12,480", change: "+8.4%", trendingUp: true },
  {
    label: "Last 7 days",
    value: "$82,130",
    change: "+12.1%",
    trendingUp: true,
  },
  {
    label: "Last 30 days",
    value: "$348,920",
    change: "+5.7%",
    trendingUp: true,
  },
];

const SALES_SPARKLINE: SimpleSparkPoint[] = [
  { label: "Mon", value: 10400 },
  { label: "Tue", value: 11040 },
  { label: "Wed", value: 9870 },
  { label: "Thu", value: 12040 },
  { label: "Fri", value: 13280 },
  { label: "Sat", value: 14500 },
  { label: "Sun", value: 15040 },
];

const SALES_TREND: SalesTrendPoint[] = [
  { day: "Week 1", revenue: 61200, orders: 186 },
  { day: "Week 2", revenue: 65480, orders: 194 },
  { day: "Week 3", revenue: 67210, orders: 201 },
  { day: "Week 4", revenue: 69340, orders: 208 },
  { day: "Week 5", revenue: 71800, orders: 214 },
  { day: "Week 6", revenue: 74260, orders: 222 },
];

function Sparkline({
  data,
  color,
}: {
  data: SimpleSparkPoint[];
  color: string;
}) {
  const gradientId = useId();

  return (
    <ResponsiveContainer width="100%" height={56}>
      <AreaChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            borderColor: "#e2e8f0",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.1)",
          }}
          labelFormatter={(label) => `Day: ${label}`}
          formatter={(value: number) => [
            `$${Number(value).toLocaleString()}`,
            "Revenue",
          ]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SalesOverviewSection() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm shadow-blue-100/40 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Sales Overview
          </h2>
          <p className="text-sm text-slate-600">
            At-a-glance revenue trends with live conversion performance.
          </p>
        </div>
        <Badge
          variant="outline"
          className="flex items-center gap-2 border-[#1e3a8a]/30 text-[#1e3a8a]"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1e3a8a]/50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1e3a8a]" />
          </span>
          Live sync every 15 min
        </Badge>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {SALES_SNAPSHOTS.map((snapshot) => {
          const Icon = snapshot.trendingUp ? ArrowUpRight : ArrowDownRight;
          return (
            <Card
              key={snapshot.label}
              className="border-none bg-gradient-to-br from-white via-white to-slate-100 shadow-md shadow-slate-200"
            >
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {snapshot.label}
                </CardDescription>
                <CardTitle className="text-3xl font-semibold text-slate-900">
                  {snapshot.value}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between pb-4">
                <span
                  className={cn(
                    "inline-flex items-center text-sm font-medium",
                    snapshot.trendingUp ? "text-emerald-600" : "text-rose-600"
                  )}
                >
                  <Icon className="mr-1 h-4 w-4" aria-hidden="true" />
                  {snapshot.change}
                </span>
                <div className="h-14 w-24">
                  <Sparkline data={SALES_SPARKLINE} color="#1e3a8a" />
                </div>
              </CardContent>
            </Card>
          );
        })}
        <Card className="border-none bg-slate-900 text-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Weekly revenue trajectory
            </CardTitle>
            <CardDescription className="text-slate-300">
              Orders and net revenue over the trailing six weeks.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SALES_TREND} margin={{ left: -12, right: 12 }}>
                <CartesianGrid
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="4 4"
                />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
                <YAxis
                  stroke="rgba(255,255,255,0.6)"
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: 12,
                    borderColor: "#1e293b",
                    color: "#fff",
                  }}
                  formatter={(value: number, name: string) =>
                    name === "revenue"
                      ? [`$${Number(value).toLocaleString()}`, "Revenue"]
                      : [`${value} orders`, "Orders"]
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#facc15"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
