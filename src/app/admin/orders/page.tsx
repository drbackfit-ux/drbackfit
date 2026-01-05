import { OrdersSection } from "@/components/admin/OrdersSection";

export default function OrdersPage() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders Management</h1>
          <p className="mt-1 text-sm text-slate-600">
            View and manage all customer orders with real-time updates.
          </p>
        </div>
        <OrdersSection />
      </div>
    </div>
  );
}
