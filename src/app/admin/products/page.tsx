import { ProductsSection } from "@/components/admin/ProductsSection";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Products Management
          </h1>
          <p className="mt-2 text-slate-600">
            Add, edit, and manage your product catalog
          </p>
        </div>
        
        {/* Full Product Management Interface */}
        <ProductsSection />
      </div>
    </div>
  );
}
