"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Package, ShoppingCart, Warehouse } from "lucide-react";
import {
  LOW_STOCK_ALERTS,
  TOP_SELLERS,
  INVENTORY_SKUS,
  INVENTORY_STATUS_STYLES,
} from "@/services/admin.service";

export function ProductsSection() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-blue-100/30">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Product Overview
          </h2>
          <p className="text-sm text-slate-600">
            Inventory warnings, top movers, and SKU performance.
          </p>
        </div>
        <Button
          variant="ghost"
          className="h-9 rounded-full border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
        >
          <Warehouse className="mr-2 h-4 w-4" aria-hidden="true" />
          Replenishment planner
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">
              Low stock alerts
            </CardTitle>
            <Package className="h-5 w-5 text-[#1e3a8a]" aria-hidden="true" />
          </CardHeader>
          <CardContent className="space-y-3">
            {LOW_STOCK_ALERTS.map((alert) => (
              <div
                key={alert.sku}
                className="rounded-xl border border-amber-100 bg-amber-50 p-3"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {alert.name}
                </p>
                <p className="text-xs text-slate-500">{alert.sku}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                  <span>{alert.stockLeft} units remaining</span>
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-white text-amber-700"
                  >
                    Reorder at {alert.threshold}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">
              Top sellers
            </CardTitle>
            <ShoppingCart
              className="h-5 w-5 text-[#1e3a8a]"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            {TOP_SELLERS.map((product) => (
              <div
                key={product.name}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Units sold: {product.units}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-[#1e3a8a]"
                >
                  {product.revenue}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">
              Inventory by SKU
            </CardTitle>
            <Badge
              variant="outline"
              className="border-[#1e3a8a]/40 text-[#1e3a8a]"
            >
              Auto alerts on
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {INVENTORY_SKUS.map((item) => (
              <div
                key={item.sku}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500">{item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.stock} units
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                      INVENTORY_STATUS_STYLES[item.status]
                    )}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
