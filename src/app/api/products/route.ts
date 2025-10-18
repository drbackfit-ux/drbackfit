import { NextResponse } from 'next/server';
import { getProducts as getServerProducts } from '@/services/products.service';

export async function GET() {
  try {
    const products = await getServerProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
