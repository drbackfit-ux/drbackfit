import { Product, ProductsSchema } from "@/models/Product";

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch('/api/products');
    const data = await response.json();
    return ProductsSchema.parse(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(`/api/products/${slug}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}
