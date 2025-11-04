import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminDb, hasAdminConfig } from "@/lib/firebase/server";
import { productDetailServerFirestore, initializeServerFirestore } from "@/lib/firestore-product-detail-server";

// Helper to ensure Firestore is initialized
function ensureFirestoreInitialized() {
  try {
    if (hasAdminConfig()) {
      const db = getFirebaseAdminDb();
      initializeServerFirestore(db);
      console.log("✅ Firestore initialized for [id] route");
    }
  } catch (error) {
    console.warn("⚠️ Firestore initialization failed:", error);
  }
}

/**
 * GET /api/product-details/[id]
 * Fetch a single product detail by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    ensureFirestoreInitialized(); // Ensure initialized before use
    const { id } = await params;
    const product = await productDetailServerFirestore.getProductById(id);
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch product detail" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/product-details/[id]
 * Update a product detail
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    ensureFirestoreInitialized(); // Ensure initialized before use
    const { id } = await params;
    console.log(`🌐 [API] PUT /api/product-details/${id}`);
    
    const body = await request.json();
    console.log(`📦 [API] Request body keys:`, Object.keys(body));
    
    // Check if product exists
    console.log(`🔍 [API] Checking if product exists...`);
    const existingProduct = await productDetailServerFirestore.getProductById(id);
    if (!existingProduct) {
      console.error(`❌ [API] Product ${id} not found`);
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    console.log(`✅ [API] Product found: ${existingProduct.title}`);
    console.log(`🔄 [API] Updating product...`);
    await productDetailServerFirestore.updateProduct(id, body);
    
    console.log(`✅ [API] Product updated successfully`);
    return NextResponse.json(
      { message: "Product updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ [API] Error updating product detail:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update product detail", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/product-details/[id]
 * Delete a product detail
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    ensureFirestoreInitialized(); // Ensure initialized before use
    const { id } = await params;
    
    // Check if product exists
    const existingProduct = await productDetailServerFirestore.getProductById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    await productDetailServerFirestore.deleteProduct(id);
    
    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product detail:", error);
    return NextResponse.json(
      { error: "Failed to delete product detail" },
      { status: 500 }
    );
  }
}
