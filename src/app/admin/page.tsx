import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Download, RefreshCcw } from "lucide-react";
import { SalesOverviewSection } from "@/components/admin/SalesOverviewSection";
import { OrdersSection } from "@/components/admin/OrdersSection";
import { CustomersSection } from "@/components/admin/CustomersSection";
import { ProductsSection } from "@/components/admin/ProductsSection";
import { PaymentsSection } from "@/components/admin/PaymentsSection";
import { ShippingSection } from "@/components/admin/ShippingSection";
import { AnalyticsSection } from "@/components/admin/AnalyticsSection";

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Badge className="w-fit bg-[#1e3a8a] text-white hover:bg-[#1e3a8a]">
              Internal
            </Badge>
            <h1 className="text-3xl font-semibold text-slate-900">
              Admin Control Center
            </h1>
            <p className="max-w-xl text-sm text-slate-600">
              Monitor sales momentum, inventory health, and customer happiness
              for the Dr Backfit Atelier storefront.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className="border-[#1e3a8a]/30 text-[#1e3a8a]"
            >
              <RefreshCcw className="mr-2 h-4 w-4" aria-hidden="true" />
              Refresh metrics
            </Button>
            <Button className="bg-[#1e3a8a] text-white hover:bg-[#1e3a8a]/90">
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Export snapshot
            </Button>
          </div>
        </header>

        <div className="mt-10 space-y-10">
          {/* Sales Overview */}
          <SalesOverviewSection />

          {/* Orders + Customers */}
          <div className="grid gap-8 xl:grid-cols-2">
            <OrdersSection />
            <CustomersSection />
          </div>

          {/* Products */}
          <ProductsSection />

          {/* Analytics */}
          <AnalyticsSection />

          {/* Payments + Shipping */}
          <div className="grid gap-8 xl:grid-cols-2">
            <PaymentsSection />
            <ShippingSection />
          </div>
        </div>
      </div>
    </main>
  );
}
