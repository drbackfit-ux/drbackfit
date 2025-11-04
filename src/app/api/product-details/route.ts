import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminDb, hasAdminConfig } from "@/lib/firebase/server";
import { productDetailServerFirestore, initializeServerFirestore } from "@/lib/firestore-product-detail-server";
import type { ProductDetail } from "@/models/ProductDetail";
import seedData from "@/data/seed-data.json";

// Initialize server Firestore if available
let isFirestoreAvailable = false;
try {
  if (hasAdminConfig()) {
    const db = getFirebaseAdminDb();
    initializeServerFirestore(db);
    isFirestoreAvailable = true;
    console.log("✅ Server Firestore initialized for product-details API");
  } else {
    console.warn("⚠️ Firebase Admin not configured. Using client SDK initialization instead.");
    console.warn("⚠️ For production, set up Firebase Admin SDK with service account keys.");
  }
} catch (error) {
  console.warn("⚠️ Server Firestore initialization failed:", error);
  console.warn("⚠️ Will use fallback data");
}

// Fallback to static data
function getFallbackProducts(): ProductDetail[] {
  // Transform seed data to ProductDetail format
  return seedData.products.map((p: any) => ({
    ...p,
    subtitle: p.shortDescription || "",
    pricing: {
      currency: "INR",
      mrp: p.priceEstimateMax || 0,
      salePrice: p.priceEstimateMin || 0,
      discountPercent: 0,
      savingsAmount: 0,
      taxInclusiveLabel: "Inclusive of all taxes",
    },
    rating: {
      average: 4.5,
      count: 0,
    },
    stockStatus: {
      label: "In Stock",
      inStock: true,
    },
    videoShopping: {
      title: "Shop via Video Call",
      description: "Get personalized assistance",
      ctaLabel: "Book Now",
      ctaHref: "/contact",
      imageUrl: "",
    },
    serviceHighlights: [],
    detailSections: [],
    offers: [],
    overviewPoints: [],
    faqs: [],
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Products", href: "/catalog" },
    ],
  })) as ProductDetail[];
}

/**
 * GET /api/product-details
 * Fetch all product details with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters = {
      category: searchParams.get("category") || undefined,
      inStock: searchParams.get("inStock") === "true" ? true : searchParams.get("inStock") === "false" ? false : undefined,
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      tags: searchParams.get("tags")?.split(",") || undefined,
    };

    // Try Firebase first
    try {
      if (!isFirestoreAvailable) {
        throw new Error("Firestore not configured");
      }
      const products = await productDetailServerFirestore.getProducts(filters);
      return NextResponse.json(products);
    } catch (firebaseError) {
      console.warn("Firebase unavailable, using fallback data:", firebaseError);
      // Fallback to static data
      const fallbackProducts = getFallbackProducts();
      
      // Apply filters to fallback data
      let filtered = fallbackProducts;
      
      if (filters.category) {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      
      if (filters.inStock !== undefined) {
        filtered = filtered.filter(p => p.stockStatus.inStock === filters.inStock);
      }
      
      if (filters.minPrice !== undefined) {
        filtered = filtered.filter(p => p.pricing.salePrice >= filters.minPrice!);
      }
      
      if (filters.maxPrice !== undefined) {
        filtered = filtered.filter(p => p.pricing.salePrice <= filters.maxPrice!);
      }
      
      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(p => 
          p.tags.some(tag => filters.tags!.includes(tag))
        );
      }
      
      return NextResponse.json(filtered);
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
    return NextResponse.json(
      { error: "Failed to fetch product details" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/product-details
 * Create a new product detail
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("📝 Creating product with data:", {
      title: body.title,
      slug: body.slug,
      category: body.category,
      hasImages: body.images?.length > 0,
    });
    
    // Validate required fields
    if (!body.title || !body.slug || !body.category) {
      console.error("❌ Missing required fields:", { 
        hasTitle: !!body.title, 
        hasSlug: !!body.slug, 
        hasCategory: !!body.category 
      });
      return NextResponse.json(
        { error: "Missing required fields: title, slug, category" },
        { status: 400 }
      );
    }
    
    // Remove id from body before adding (Firestore generates it)
    const { id, ...productDataWithoutId } = body;
    
    if (!isFirestoreAvailable) {
      return NextResponse.json(
        { error: "Firebase Admin SDK not configured. Please set up service account credentials." },
        { status: 503 }
      );
    }
    
    const productId = await productDetailServerFirestore.addProduct(productDataWithoutId);
    
    console.log("✅ Product created successfully with ID:", productId);
    
    return NextResponse.json(
      { id: productId, message: "Product created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating product detail:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create product detail", details: errorMessage },
      { status: 500 }
    );
  }
}
