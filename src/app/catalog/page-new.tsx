import { Suspense } from "react";
import CatalogClient from "./catalog-client";
import { getCatalogProducts } from "@/services/products.service";

// Enable ISR with revalidation
export const revalidate = 3600;

async function CatalogContent({ searchParams }: { searchParams: { category?: string } }) {
  // Fetch catalog products from Firestore (products marked for catalog display)
  const products = await getCatalogProducts();
  
  return <CatalogClient initialProducts={products} initialCategory={searchParams.category} />;
}

export default function Catalog({ searchParams }: { searchParams: { category?: string } }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      }
    >
      <CatalogContent searchParams={searchParams} />
    </Suspense>
  );
}
