"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SHIPPING_METHODS, DELIVERY_FEED } from "@/services/admin.service";

export function ShippingSection() {
  const [shippingToggles, setShippingToggles] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(
      SHIPPING_METHODS.map((method) => [method.name, method.active])
    )
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-blue-100/30">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-900">
          Shipping & logistics
        </h2>
        <p className="text-sm text-slate-600">
          Configure methods, assign carriers, and monitor delivery updates.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {SHIPPING_METHODS.map((method) => (
          <div
            key={method.name}
            className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {method.name}
                </p>
                <p className="text-xs text-slate-500">
                  {method.carrier} · {method.transitTime} · Base rate{" "}
                  {method.baseRate}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={shippingToggles[method.name]}
                  onCheckedChange={(checked) =>
                    setShippingToggles((current) => ({
                      ...current,
                      [method.name]: checked,
                    }))
                  }
                />
                <Badge
                  variant="outline"
                  className="border-slate-200 text-xs text-slate-600"
                >
                  {shippingToggles[method.name] ? "Active" : "Paused"}
                </Badge>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 rounded-full border border-slate-200 px-3 text-xs text-slate-700 hover:bg-white"
              >
                Adjust rates
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 rounded-full border border-slate-200 px-3 text-xs text-slate-700 hover:bg-white"
              >
                Assign warehouses
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 rounded-full border border-slate-200 px-3 text-xs text-slate-700 hover:bg-white"
              >
                Connect carrier portal
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Delivery status feed
        </h3>
        <div className="mt-3 space-y-3">
          {DELIVERY_FEED.map((event) => (
            <div
              key={event.id}
              className="rounded-xl border border-slate-100 bg-white p-3 text-sm text-slate-600"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{event.carrier}</span>
                <span>{event.timestamp}</span>
              </div>
              <p className="mt-1 font-semibold text-slate-900">
                {event.status}
              </p>
              <p>{event.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
