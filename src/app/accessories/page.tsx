import AccessoriesClient from "./accessories-client";
import { getAccessoriesProducts } from "@/services/products.service";

// Enable ISR with revalidation
export const revalidate = 3600;

export default async function AccessoriesPage() {
  // Fetch accessories products from Firestore (products marked for accessories page)
  const products = await getAccessoriesProducts();
  
  return <AccessoriesClient initialProducts={products} />;
}
