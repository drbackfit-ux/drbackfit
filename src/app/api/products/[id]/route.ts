import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminDb, hasAdminConfig } from '@/lib/firebase/server';

const PRODUCTS_COLLECTION = 'products';

// GET - Get a single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!hasAdminConfig()) {
      return NextResponse.json(
        { error: 'Firebase not configured' },
        { status: 503 }
      );
    }

    const db = getFirebaseAdminDb();
    const productRef = db.collection(PRODUCTS_COLLECTION).doc(params.id);
    const doc = await productRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data()?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!hasAdminConfig()) {
      return NextResponse.json(
        { error: 'Firebase not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    const db = getFirebaseAdminDb();
    const productRef = db.collection(PRODUCTS_COLLECTION).doc(params.id);
    
    // Check if product exists
    const doc = await productRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update the product
    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    // Generate new slug if title is being updated
    if (body.title && !body.slug) {
      updateData.slug = generateSlug(body.title);
    }

    await productRef.update(updateData);

    return NextResponse.json({ 
      message: 'Product updated successfully' 
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!hasAdminConfig()) {
      return NextResponse.json(
        { error: 'Firebase not configured' },
        { status: 503 }
      );
    }

    const db = getFirebaseAdminDb();
    const productRef = db.collection(PRODUCTS_COLLECTION).doc(params.id);
    
    // Check if product exists
    const doc = await productRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete the product
    await productRef.delete();

    return NextResponse.json({ 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
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
