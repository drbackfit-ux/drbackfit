"use client";

import React from "react";

// Minimal placeholder to avoid build-time errors caused by missing legacy imports
export function ProductsSection() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Product Overview (legacy)</h2>
        <p className="text-sm text-muted-foreground">
          Legacy section disabled — see new ProductsSection component.
        </p>
      </div>
    </section>
  );
}
