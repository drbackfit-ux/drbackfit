"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { TRAFFIC_SERIES, CONVERSION_METRICS } from "@/services/admin.service";

export function AnalyticsSection() {
  return (
    <section className="grid gap-6 xl:grid-cols-3">
      <Card className="border-none bg-gradient-to-br from-white via-white to-slate-100 shadow-lg shadow-slate-200 xl:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Traffic & conversion
            </CardTitle>
            <CardDescription>
              Compare visits to completed checkouts for the past 7 days.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="border-[#1e3a8a]/30 text-[#1e3a8a]"
          >
            Powered by analytics
          </Badge>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={TRAFFIC_SERIES} margin={{ left: -8, right: 16 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "#cbd5f5",
                  boxShadow: "0 10px 30px rgba(30, 58, 138, 0.1)",
                }}
                formatter={(value: number, name: string) =>
                  name === "visits"
                    ? [`${Number(value).toLocaleString()} visits`, "Visits"]
                    : [
                        `${Number(value).toLocaleString()} checkouts`,
                        "Conversions",
                      ]
                }
              />
              <Line
                type="monotone"
                dataKey="visits"
                stroke="#1e3a8a"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="conversions"
                stroke="#22d3ee"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900">
            Conversion metrics
          </CardTitle>
          <CardDescription>Key funnel ratios updated hourly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {CONVERSION_METRICS.map((metric) => {
            const Icon = metric.trendingUp ? ArrowUpRight : ArrowDownRight;
            return (
              <div key={metric.label} className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">
                    {metric.label}
                  </p>
                  <Badge
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
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {metric.value}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}
