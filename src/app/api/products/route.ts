import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminDb, hasAdminConfig } from '@/lib/firebase/server';
import { getProducts as getServerProducts } from '@/services/products.service';

const PRODUCTS_COLLECTION = 'products';

// GET - Fetch all products or products by section/category
export async function GET(request: NextRequest) {
  try {
    // Check if Firebase is configured
    if (!hasAdminConfig()) {
      // Fallback to static products service
      const products = await getServerProducts();
      return NextResponse.json({ products });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const category = searchParams.get('category');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    const db = getFirebaseAdminDb();
    let query: any = db.collection(PRODUCTS_COLLECTION);
    
    // Filter by section if provided
    if (section) {
      query = query.where('section', '==', section);
    }
    
    // Filter by category if provided
    if (category) {
      query = query.where('category', '==', category);
    }
    
    // Filter by active status unless includeInactive is true
    if (!includeInactive) {
      query = query.where('isActive', '==', true);
    }
    
    // Order by creation date
    query = query.orderBy('createdAt', 'desc');
    
    const snapshot = await query.get();
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to ISO strings for JSON serialization
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    
    // Fallback to static products if Firebase fails
    try {
      const products = await getServerProducts();
      return NextResponse.json({ 
        products, 
        fallback: true,
        message: 'Using fallback data due to Firebase connection issue' 
      });
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    if (!hasAdminConfig()) {
      return NextResponse.json(
        { error: 'Firebase not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    // Basic validation
    if (!body.title || !body.description || !body.price || !body.section || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, price, section, category' },
        { status: 400 }
      );
    }
    
    const db = getFirebaseAdminDb();
    const productsRef = db.collection(PRODUCTS_COLLECTION);
    
    // Add timestamps and defaults
    const now = new Date();
    const productDoc = {
      ...body,
      slug: body.slug || generateSlug(body.title),
      imageUrls: body.imageUrls || [],
      isActive: body.isActive ?? true,
      stock: body.stock || 0,
      tags: body.tags || [],
      materials: body.materials || [],
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await productsRef.add(productDoc);
    
    return NextResponse.json({ 
      id: docRef.id,
      message: 'Product created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}
