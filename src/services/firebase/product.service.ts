import "server-only";

import { cache } from "react";
import type {
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { ProductDetail, ProductDetailSchema } from "@/models/ProductDetail";
import { Product, ProductSchema } from "@/models/Product";
import { Review, ReviewSchema } from "@/models/Review";
import { getFirebaseAdminDb, hasAdminConfig } from "@/lib/firebase/server";
import { prepareProductPayload } from "@/utils/product-normalizer";
import seedData from "@/data/seed-data.json";
import accessoriesData from "@/data/accessories-data.json";

const PRODUCTS_COLLECTION = "products";
const REVIEWS_SUBCOLLECTION = "reviews";

const normalizeProductDocument = (doc: QueryDocumentSnapshot<DocumentData>) =>
  prepareProductPayload(doc.data(), doc.id);

const parseProduct = (doc: QueryDocumentSnapshot<DocumentData>) => {
  const normalized = normalizeProductDocument(doc);
  return ProductSchema.parse(normalized);
};

const parseProductDetail = (doc: QueryDocumentSnapshot<DocumentData>) => {
  const normalized = normalizeProductDocument(doc);
  return ProductDetailSchema.parse(normalized);
};

export const fetchAllProductSlugs = cache(async (): Promise<string[]> => {
  // Always return static slugs during build time or when Firebase is not configured
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production' && !hasAdminConfig()) {
    console.log("Using static data for product slugs during build time");
    const seedSlugs = seedData.products.map((p) => p.slug);
    const accessorySlugs = accessoriesData.products.map((p) => p.slug);
    const allSlugs = [...seedSlugs, ...accessorySlugs];
    return Array.from(new Set(allSlugs));
  }

  try {
    const db = getFirebaseAdminDb();
    const snapshot = await db
      .collection(PRODUCTS_COLLECTION)
      .select("slug")
      .get();
    const firestoreSlugs = snapshot.docs
      .map((doc) => doc.data()?.slug as string | undefined)
      .filter((slug): slug is string => Boolean(slug));

    // Get slugs from seed data and accessories
    const seedSlugs = seedData.products.map((p) => p.slug);
    const accessorySlugs = accessoriesData.products.map((p) => p.slug);

    // Combine all slugs and remove duplicates
    const allSlugs = [...firestoreSlugs, ...seedSlugs, ...accessorySlugs];
    return Array.from(new Set(allSlugs));
  } catch (error) {
    // Check if it's a Firebase configuration error
    if (error instanceof Error && error.message === "FIREBASE_NOT_CONFIGURED") {
      console.warn("Firebase not configured, falling back to static data");
    } else {
      console.error("Error fetching slugs from Firestore:", error);
    }

    // Fallback to static data if Firestore fails
    const seedSlugs = seedData.products.map((p) => p.slug);
    const accessorySlugs = accessoriesData.products.map((p) => p.slug);
    const allSlugs = [...seedSlugs, ...accessorySlugs];
    return Array.from(new Set(allSlugs));
  }
});

const toProductDetailFallback = (product: Product): ProductDetail => {
  const discount = Math.max(
    0,
    Math.round(
      ((product.priceEstimateMax - product.priceEstimateMin) /
        product.priceEstimateMax) *
        100
    )
  );

  // Generate multiple images for better gallery experience
  const generateProductImages = (baseImage: string, category: string) => {
    const images = [baseImage]; // Start with the original image

    // Add category-specific additional images
    if (category === "beds") {
      images.push(
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop", // Bedroom lifestyle
        "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&h=600&fit=crop", // Bed detail
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop", // Side angle
        "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&h=600&fit=crop" // Room setting
      );
    } else if (category === "sofas") {
      images.push(
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop", // Living room lifestyle
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop", // Sofa detail
        "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&h=600&fit=crop", // Different angle
        "https://images.unsplash.com/photo-1615875605825-5eb9bb5d52ac?w=800&h=600&fit=crop" // Room context
      );
    } else if (category === "pillow") {
      images.push(
        "https://images.unsplash.com/photo-1584100936454-c863c44e9f45?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1584100936753-ab37c6fe6e37?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1584100936538-35cd235eb451?w=800&h=600&fit=crop"
      );
    } else if (category === "cover") {
      images.push(
        "https://images.unsplash.com/photo-1578898887932-dce23a595ad4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1578898887277-c7c77f5eba6c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1578898887068-4b53ff878e44?w=800&h=600&fit=crop"
      );
    } else {
      // Generic furniture images for other categories
      images.push(
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&h=600&fit=crop"
      );
    }

    return images.slice(0, 5); // Limit to 5 images max
  };

  return ProductDetailSchema.parse({
    ...product,
    images: generateProductImages(product.images[0], product.category),
    subtitle: product.shortDescription,
    pricing: {
      currency: "INR",
      mrp: product.priceEstimateMax,
      salePrice: product.priceEstimateMin,
      discountPercent: discount,
      savingsAmount: Math.max(
        0,
        product.priceEstimateMax - product.priceEstimateMin
      ),
      couponPrice: Math.round(product.priceEstimateMin * 0.9),
      couponCode: "NEW10",
      couponDescription: "Use coupon NEW10",
      emiText: "EMI starting ₹960/month",
      taxInclusiveLabel: "Inclusive of all taxes",
    },
    stockStatus: {
      label: "In stock",
      subLabel: `Dispatch in ${product.leadTimeDays} days`,
      inStock: true,
    },
    sizeOptions:
      product.category === "mattresses" || product.category === "beds"
        ? [
            // Standard Single Sizes
            {
              label: 'Single | 90 X 190 (0.90 m x 1.90 m) | 3" (7.6cm)',
              value: "single-3",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Single | 90 X 190 (0.90 m x 1.90 m) | 4" (10.2cm)',
              value: "single-4",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Single | 90 X 190 (0.90 m x 1.90 m) | 5" (12.7cm)',
              value: "single-5",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Single | 90 X 190 (0.90 m x 1.90 m) | 6" (15.2cm)',
              value: "single-6",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Single | 90 X 190 (0.90 m x 1.90 m) | 8" (20.3cm)',
              value: "single-8",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Single | 90 X 190 (0.90 m x 1.90 m) | 10" (25.4cm)',
              value: "single-10",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Single | 90 X 190 (0.90 m x 1.90 m) | 12" (30.5cm)',
              value: "single-12",
              inStock: true,
              isDefault: false,
            },

            // Extended Single Sizes
            {
              label: 'Single XL | 90 X 200 (0.90 m x 2.00 m) | 3" (7.6cm)',
              value: "single-xl-3",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Single XL | 90 X 200 (0.90 m x 2.00 m) | 4" (10.2cm)',
              value: "single-xl-4",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Single XL | 90 X 200 (0.90 m x 2.00 m) | 5" (12.7cm)',
              value: "single-xl-5",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Single XL | 90 X 200 (0.90 m x 2.00 m) | 6" (15.2cm)',
              value: "single-xl-6",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Single XL | 90 X 200 (0.90 m x 2.00 m) | 8" (20.3cm)',
              value: "single-xl-8",
              inStock: true,
              isDefault: false,
            },

            // Double/Full Sizes
            {
              label: 'Double | 135 X 190 (1.35 m x 1.90 m) | 3" (7.6cm)',
              value: "double-3",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Double | 135 X 190 (1.35 m x 1.90 m) | 4" (10.2cm)',
              value: "double-4",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Double | 135 X 190 (1.35 m x 1.90 m) | 5" (12.7cm)',
              value: "double-5",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Double | 135 X 190 (1.35 m x 1.90 m) | 6" (15.2cm)',
              value: "double-6",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Double | 135 X 190 (1.35 m x 1.90 m) | 8" (20.3cm)',
              value: "double-8",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Double | 135 X 190 (1.35 m x 1.90 m) | 10" (25.4cm)',
              value: "double-10",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Double | 135 X 190 (1.35 m x 1.90 m) | 12" (30.5cm)',
              value: "double-12",
              inStock: true,
              isDefault: false,
            },

            // Queen Sizes
            {
              label: 'Queen | 150 X 190 (1.50 m x 1.90 m) | 3" (7.6cm)',
              value: "queen-3",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Queen | 150 X 190 (1.50 m x 1.90 m) | 4" (10.2cm)',
              value: "queen-4",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Queen | 150 X 190 (1.50 m x 1.90 m) | 5" (12.7cm)',
              value: "queen-5",
              inStock: true,
              isDefault: true,
            },
            {
              label: 'Queen | 150 X 190 (1.50 m x 1.90 m) | 6" (15.2cm)',
              value: "queen-6",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Queen | 150 X 190 (1.50 m x 1.90 m) | 8" (20.3cm)',
              value: "queen-8",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Queen | 150 X 190 (1.50 m x 1.90 m) | 10" (25.4cm)',
              value: "queen-10",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Queen | 150 X 190 (1.50 m x 1.90 m) | 12" (30.5cm)',
              value: "queen-12",
              inStock: true,
              isDefault: false,
            },

            // Queen XL Sizes
            {
              label: 'Queen XL | 160 X 200 (1.60 m x 2.00 m) | 4" (10.2cm)',
              value: "queen-xl-4",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Queen XL | 160 X 200 (1.60 m x 2.00 m) | 5" (12.7cm)',
              value: "queen-xl-5",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Queen XL | 160 X 200 (1.60 m x 2.00 m) | 6" (15.2cm)',
              value: "queen-xl-6",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Queen XL | 160 X 200 (1.60 m x 2.00 m) | 8" (20.3cm)',
              value: "queen-xl-8",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Queen XL | 160 X 200 (1.60 m x 2.00 m) | 10" (25.4cm)',
              value: "queen-xl-10",
              inStock: true,
              isDefault: false,
            },

            // King Sizes
            {
              label: 'King | 180 X 200 (1.80 m x 2.00 m) | 3" (7.6cm)',
              value: "king-3",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'King | 180 X 200 (1.80 m x 2.00 m) | 4" (10.2cm)',
              value: "king-4",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'King | 180 X 200 (1.80 m x 2.00 m) | 5" (12.7cm)',
              value: "king-5",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'King | 180 X 200 (1.80 m x 2.00 m) | 6" (15.2cm)',
              value: "king-6",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'King | 180 X 200 (1.80 m x 2.00 m) | 8" (20.3cm)',
              value: "king-8",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'King | 180 X 200 (1.80 m x 2.00 m) | 10" (25.4cm)',
              value: "king-10",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'King | 180 X 200 (1.80 m x 2.00 m) | 12" (30.5cm)',
              value: "king-12",
              inStock: true,
              isDefault: false,
            },

            // Super King Sizes
            {
              label: 'Super King | 200 X 200 (2.00 m x 2.00 m) | 4" (10.2cm)',
              value: "super-king-4",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Super King | 200 X 200 (2.00 m x 2.00 m) | 5" (12.7cm)',
              value: "super-king-5",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Super King | 200 X 200 (2.00 m x 2.00 m) | 6" (15.2cm)',
              value: "super-king-6",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Super King | 200 X 200 (2.00 m x 2.00 m) | 8" (20.3cm)',
              value: "super-king-8",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Super King | 200 X 200 (2.00 m x 2.00 m) | 10" (25.4cm)',
              value: "super-king-10",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Super King | 200 X 200 (2.00 m x 2.00 m) | 12" (30.5cm)',
              value: "super-king-12",
              inStock: true,
              isDefault: false,
            },

            // California King Sizes
            {
              label:
                'California King | 183 X 213 (1.83 m x 2.13 m) | 4" (10.2cm)',
              value: "cal-king-4",
              inStock: false,
              isDefault: false,
            },
            {
              label:
                'California King | 183 X 213 (1.83 m x 2.13 m) | 5" (12.7cm)',
              value: "cal-king-5",
              inStock: false,
              isDefault: false,
            },
            {
              label:
                'California King | 183 X 213 (1.83 m x 2.13 m) | 6" (15.2cm)',
              value: "cal-king-6",
              inStock: false,
              isDefault: false,
            },
            {
              label:
                'California King | 183 X 213 (1.83 m x 2.13 m) | 8" (20.3cm)',
              value: "cal-king-8",
              inStock: false,
              isDefault: false,
            },
            {
              label:
                'California King | 183 X 213 (1.83 m x 2.13 m) | 10" (25.4cm)',
              value: "cal-king-10",
              inStock: false,
              isDefault: false,
            },

            // Eastern King Sizes
            {
              label: 'Eastern King | 193 X 203 (1.93 m x 2.03 m) | 6" (15.2cm)',
              value: "eastern-king-6",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Eastern King | 193 X 203 (1.93 m x 2.03 m) | 8" (20.3cm)',
              value: "eastern-king-8",
              inStock: true,
              isDefault: false,
            },
            {
              label:
                'Eastern King | 193 X 203 (1.93 m x 2.03 m) | 10" (25.4cm)',
              value: "eastern-king-10",
              inStock: true,
              isDefault: false,
            },

            // Custom/European Sizes
            {
              label:
                'European Single | 90 X 200 (0.90 m x 2.00 m) | 5" (12.7cm)',
              value: "euro-single-5",
              inStock: true,
              isDefault: false,
            },
            {
              label:
                'European Double | 140 X 200 (1.40 m x 2.00 m) | 5" (12.7cm)',
              value: "euro-double-5",
              inStock: true,
              isDefault: false,
            },
            {
              label:
                'European King | 160 X 200 (1.60 m x 2.00 m) | 6" (15.2cm)',
              value: "euro-king-6",
              inStock: true,
              isDefault: false,
            },
            {
              label:
                'European Super King | 180 X 200 (1.80 m x 2.00 m) | 6" (15.2cm)',
              value: "euro-super-king-6",
              inStock: true,
              isDefault: false,
            },

            // Specialty Sizes
            {
              label: 'Twin | 99 X 190 (0.99 m x 1.90 m) | 4" (10.2cm)',
              value: "twin-4",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Twin XL | 99 X 203 (0.99 m x 2.03 m) | 4" (10.2cm)',
              value: "twin-xl-4",
              inStock: true,
              isDefault: false,
            },
            {
              label: 'Full XL | 137 X 203 (1.37 m x 2.03 m) | 5" (12.7cm)',
              value: "full-xl-5",
              inStock: true,
              isDefault: false,
            },
            {
              label:
                'Olympic Queen | 168 X 203 (1.68 m x 2.03 m) | 6" (15.2cm)',
              value: "olympic-queen-6",
              inStock: true,
              isDefault: false,
            },
            {
              label:
                'Split King | 2x 97 X 203 (0.97 m x 2.03 m each) | 8" (20.3cm)',
              value: "split-king-8",
              inStock: true,
              isDefault: false,
            },
            {
              label:
                'Split California King | 2x 91 X 213 (0.91 m x 2.13 m each) | 8" (20.3cm)',
              value: "split-cal-king-8",
              inStock: false,
              isDefault: false,
            },
          ]
        : product.category === "sofas"
        ? [
            // 1-Seater Sofas
            {
              label: "1-Seater | 90 X 85 X 85 cm | Compact",
              value: "1-seater-compact",
              inStock: true,
              isDefault: false,
            },
            {
              label: "1-Seater | 100 X 90 X 85 cm | Standard",
              value: "1-seater-standard",
              inStock: true,
              isDefault: false,
            },
            {
              label: "1-Seater | 110 X 95 X 90 cm | Luxury",
              value: "1-seater-luxury",
              inStock: true,
              isDefault: false,
            },

            // 2-Seater Sofas
            {
              label: "2-Seater | 130 X 80 X 85 cm | Compact",
              value: "2-seater-compact",
              inStock: true,
              isDefault: false,
            },
            {
              label: "2-Seater | 150 X 80 X 85 cm | Standard",
              value: "2-seater-standard",
              inStock: true,
              isDefault: false,
            },
            {
              label: "2-Seater | 160 X 85 X 90 cm | Comfort",
              value: "2-seater-comfort",
              inStock: true,
              isDefault: false,
            },
            {
              label: "2-Seater | 170 X 90 X 95 cm | Luxury",
              value: "2-seater-luxury",
              inStock: true,
              isDefault: false,
            },

            // 3-Seater Sofas
            {
              label: "3-Seater | 180 X 85 X 85 cm | Compact",
              value: "3-seater-compact",
              inStock: true,
              isDefault: false,
            },
            {
              label: "3-Seater | 200 X 90 X 85 cm | Standard",
              value: "3-seater-standard",
              inStock: true,
              isDefault: true,
            },
            {
              label: "3-Seater | 220 X 95 X 90 cm | Comfort",
              value: "3-seater-comfort",
              inStock: true,
              isDefault: false,
            },
            {
              label: "3-Seater | 240 X 100 X 95 cm | Luxury",
              value: "3-seater-luxury",
              inStock: true,
              isDefault: false,
            },

            // 4-Seater Sofas
            {
              label: "4-Seater | 250 X 90 X 85 cm | Standard",
              value: "4-seater-standard",
              inStock: true,
              isDefault: false,
            },
            {
              label: "4-Seater | 270 X 95 X 90 cm | Comfort",
              value: "4-seater-comfort",
              inStock: true,
              isDefault: false,
            },
            {
              label: "4-Seater | 290 X 100 X 95 cm | Luxury",
              value: "4-seater-luxury",
              inStock: true,
              isDefault: false,
            },

            // L-Shape Sofas
            {
              label: "L-Shape | 220 X 160 X 85 cm | Compact Corner",
              value: "l-shape-compact",
              inStock: true,
              isDefault: false,
            },
            {
              label: "L-Shape | 250 X 180 X 85 cm | Standard Corner",
              value: "l-shape-standard",
              inStock: true,
              isDefault: false,
            },
            {
              label: "L-Shape | 280 X 200 X 90 cm | Large Corner",
              value: "l-shape-large",
              inStock: true,
              isDefault: false,
            },
            {
              label: "L-Shape | 300 X 220 X 95 cm | Luxury Corner",
              value: "l-shape-luxury",
              inStock: true,
              isDefault: false,
            },

            // Sectional Sofas
            {
              label: "Sectional | 250 X 250 X 85 cm | Square Configuration",
              value: "sectional-square",
              inStock: true,
              isDefault: false,
            },
            {
              label:
                "Sectional | 300 X 200 X 90 cm | Rectangular Configuration",
              value: "sectional-rect",
              inStock: true,
              isDefault: false,
            },
            {
              label: "Sectional | 350 X 250 X 95 cm | Large Configuration",
              value: "sectional-large",
              inStock: true,
              isDefault: false,
            },

            // Modular Sofas
            {
              label: "Modular 2-Piece | 160 X 80 X 85 cm | Standard",
              value: "modular-2piece",
              inStock: true,
              isDefault: false,
            },
            {
              label: "Modular 3-Piece | 240 X 80 X 85 cm | Standard",
              value: "modular-3piece",
              inStock: true,
              isDefault: false,
            },
            {
              label: "Modular 4-Piece | 320 X 80 X 85 cm | Standard",
              value: "modular-4piece",
              inStock: true,
              isDefault: false,
            },
            {
              label: "Modular 5-Piece | 400 X 80 X 85 cm | Large",
              value: "modular-5piece",
              inStock: true,
              isDefault: false,
            },

            // Chesterfield Sofas
            {
              label: "Chesterfield 2-Seater | 150 X 85 X 75 cm | Classic",
              value: "chesterfield-2",
              inStock: true,
              isDefault: false,
            },
            {
              label: "Chesterfield 3-Seater | 200 X 85 X 75 cm | Classic",
              value: "chesterfield-3",
              inStock: true,
              isDefault: false,
            },

            // Recliner Sofas
            {
              label: "Recliner 1-Seater | 95 X 95 X 100 cm | Manual",
              value: "recliner-1-manual",
              inStock: true,
              isDefault: false,
            },
            {
              label: "Recliner 2-Seater | 150 X 95 X 100 cm | Manual",
              value: "recliner-2-manual",
              inStock: true,
              isDefault: false,
            },
            {
              label: "Recliner 3-Seater | 200 X 95 X 100 cm | Manual",
              value: "recliner-3-manual",
              inStock: true,
              isDefault: false,
            },
            {
              label: "Recliner 1-Seater | 95 X 95 X 100 cm | Electric",
              value: "recliner-1-electric",
              inStock: true,
              isDefault: false,
            },
            {
              label: "Recliner 2-Seater | 150 X 95 X 100 cm | Electric",
              value: "recliner-2-electric",
              inStock: true,
              isDefault: false,
            },
            {
              label: "Recliner 3-Seater | 200 X 95 X 100 cm | Electric",
              value: "recliner-3-electric",
              inStock: true,
              isDefault: false,
            },

            // Sleeper Sofas
            {
              label:
                "Sleeper 2-Seater | 150 X 85 X 85 cm | Converts to Single Bed",
              value: "sleeper-2",
              inStock: true,
              isDefault: false,
            },
            {
              label:
                "Sleeper 3-Seater | 200 X 85 X 85 cm | Converts to Double Bed",
              value: "sleeper-3",
              inStock: true,
              isDefault: false,
            },

            // Loveseat Sofas
            {
              label: "Loveseat | 125 X 80 X 85 cm | Intimate Seating",
              value: "loveseat-standard",
              inStock: true,
              isDefault: false,
            },
            {
              label: "Loveseat | 140 X 85 X 90 cm | Comfort Seating",
              value: "loveseat-comfort",
              inStock: true,
              isDefault: false,
            },

            // Ottoman/Storage Sofas
            {
              label:
                "Storage Sofa 2-Seater | 150 X 80 X 85 cm | Hidden Storage",
              value: "storage-2",
              inStock: true,
              isDefault: false,
            },
            {
              label:
                "Storage Sofa 3-Seater | 200 X 90 X 85 cm | Hidden Storage",
              value: "storage-3",
              inStock: true,
              isDefault: false,
            },

            // Custom Sofas
            {
              label: "Custom Size | Specify Dimensions | Made to Order",
              value: "custom-sofa",
              inStock: false,
              isDefault: false,
            },
          ]
        : undefined,
    offers: [
      {
        title: "Bank Offer",
        description:
          "10% off for set in all purchases over ₹899 selected partner",
        icon: "%",
      },
      {
        title: "Partner Offer",
        description:
          "Buy 2 items save 5%/ Buy 3 items save 10%. Only on partner products",
        icon: "%",
      },
      {
        title: "No Cost EMI",
        description:
          "Bajaj Finserv EMI Card starting at ₹960.88 for 6 months. Only valid on select cards",
        icon: "₹",
      },
    ],
    delivery: {
      placeholder: "Enter pincode",
      ctaLabel: "Check",
      helperText: "Enter pincode to check delivery date",
    },
    videoShopping: {
      title: "Video Shopping",
      description: "Start video shopping with our Expert",
      ctaLabel: "Book Now",
      ctaHref: "/contact",
      imageUrl:
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=250&fit=crop",
    },
    serviceHighlights: [
      {
        title: "Free delivery",
        description: "Across major cities",
        icon: "truck",
      },
      { title: "Warranty", description: "Up to 2 years", icon: "warranty" },
    ],
    detailSections: [
      {
        id: "specs",
        title: "Product specifications",
        content: product.materials,
      },
      {
        id: "dimensions",
        title: "Dimensions",
        content: [
          `Width: ${product.dimensions.w} cm`,
          `Depth: ${product.dimensions.d} cm`,
          `Height: ${product.dimensions.h} cm`,
        ],
      },
      {
        id: "warranty",
        title: "Warranty",
        content: ["1 year manufacturing warranty"],
      },
    ],
    warranty: {
      title: "Warranty policy",
      description: "1 year manufacturing warranty",
    },
    breadcrumbs: [
      { label: "Home", href: "/" },
      {
        label: product.category,
        href: `/catalog?category=${product.category}`,
      },
      { label: product.title },
    ],
    rating: { average: 4.6, count: 1248 },
    ratingSummary: [
      { label: "5", percentage: 75 },
      { label: "4", percentage: 15 },
      { label: "3", percentage: 7 },
      { label: "2", percentage: 2 },
      { label: "1", percentage: 1 },
    ],
    overviewPoints: product.materials,
    faqs: [
      {
        id: "f1",
        question: "Is installation included?",
        answer: "Yes, basic installation is included in delivery.",
      },
    ],
  });
};

export const fetchProductDetailBySlug = cache(
  async (slug: string): Promise<ProductDetail | null> => {
    // Always use static data during build time or when Firebase is not configured
    if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production' && !hasAdminConfig()) {
      console.log("Using static data for product detail during build time");
      // First check seed data
      const seedProduct = seedData.products.find((p) => p.slug === slug);
      if (seedProduct) {
        return toProductDetailFallback(seedProduct);
      }

      // Then check accessories data
      const accessoryProduct = accessoriesData.products.find(
        (p) => p.slug === slug
      );
      if (accessoryProduct) {
        return toProductDetailFallback(accessoryProduct);
      }

      return null;
    }

    try {
      // First check seed data
      const seedProduct = seedData.products.find((p) => p.slug === slug);
      if (seedProduct) {
        return toProductDetailFallback(seedProduct);
      }

      // Then check accessories data
      const accessoryProduct = accessoriesData.products.find(
        (p) => p.slug === slug
      );
      if (accessoryProduct) {
        return toProductDetailFallback(accessoryProduct);
      }

      // If not found in either, try Firebase
      const snapshot = await getFirebaseAdminDb()
        .collection(PRODUCTS_COLLECTION)
        .where("slug", "==", slug)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return parseProductDetail(snapshot.docs[0]);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "FIREBASE_NOT_CONFIGURED"
      ) {
        console.warn("Firebase not configured, using static data only");
        return null;
      }
      console.error("Error fetching product:", error);
      return null;
    }
  }
);

export const fetchProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    try {
      const db = getFirebaseAdminDb();
      const snapshot = await db
        .collection(PRODUCTS_COLLECTION)
        .where("slug", "==", slug)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }
      return parseProduct(snapshot.docs[0]);
    } catch {
      const p = seedData.products.find((it) => it.slug === slug);
      return p ? ProductSchema.parse(p) : null;
    }
  }
);

export const fetchSimilarProducts = cache(
  async (
    category: string,
    excludeProductId: string,
    limit = 6
  ): Promise<Product[]> => {
    // Always use static data during build time or when Firebase is not configured
    if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production' && !hasAdminConfig()) {
      console.log("Using static data for similar products during build time");
      return seedData.products
        .filter((p) => p.category === category && p.id !== excludeProductId)
        .slice(0, limit)
        .map((p) => ProductSchema.parse(p));
    }

    try {
      const db = getFirebaseAdminDb();
      const snapshot = await db
        .collection(PRODUCTS_COLLECTION)
        .where("category", "==", category)
        .limit(limit + 1)
        .get();

      return snapshot.docs
        .filter((doc) => (doc.data()?.id ?? doc.id) !== excludeProductId)
        .slice(0, limit)
        .map(parseProduct);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "FIREBASE_NOT_CONFIGURED"
      ) {
        console.warn(
          "Firebase not configured, using static data for similar products"
        );
      } else {
        console.error("Error fetching similar products:", error);
      }

      return seedData.products
        .filter((p) => p.category === category && p.id !== excludeProductId)
        .slice(0, limit)
        .map((p) => ProductSchema.parse(p));
    }
  }
);

export const fetchProductReviews = cache(
  async (productId: string, limitCount = 6): Promise<Review[]> => {
    // Always use static data during build time or when Firebase is not configured
    if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production' && !hasAdminConfig()) {
      console.log("Using static data for product reviews during build time");
      // Return sample reviews for development
      return [
        {
          id: "review-1",
          userName: "Kabilan",
          rating: 5,
          headline: "Value for money",
          comment: "Value for money",
          createdAt: new Date("2025-04-10"),
        },
        {
          id: "review-2",
          userName: "Jerry",
          rating: 5,
          headline: "go9od",
          comment: "very comfortable",
          createdAt: new Date("2025-09-21"),
        },
        {
          id: "review-3",
          userName: "Sarah M",
          rating: 4,
          headline: "Great quality mattress",
          comment:
            "Really happy with this purchase. The memory foam is comfortable and provides good support.",
          createdAt: new Date("2025-03-15"),
        },
        {
          id: "review-4",
          userName: "Mike Chen",
          rating: 5,
          headline: "Excellent for back pain",
          comment:
            "My back pain has significantly reduced since switching to this mattress. Highly recommend!",
          createdAt: new Date("2025-02-28"),
        },
        {
          id: "review-5",
          userName: "Lisa K",
          rating: 4,
          headline: "Good value",
          comment:
            "Quality mattress at a reasonable price. Delivery was quick and setup was easy.",
          createdAt: new Date("2025-01-12"),
        },
        {
          id: "review-6",
          userName: "David R",
          rating: 5,
          headline: "Best sleep ever",
          comment:
            "I've been sleeping so much better since getting this mattress. The orthopedic support is amazing.",
          createdAt: new Date("2025-01-05"),
        },
      ] as Review[];
    }

    try {
      const db = getFirebaseAdminDb();
      const snapshot = await db
        .collection(PRODUCTS_COLLECTION)
        .doc(productId)
        .collection(REVIEWS_SUBCOLLECTION)
        .orderBy("createdAt", "desc")
        .limit(limitCount)
        .get();

      return snapshot.docs.map((doc) => {
        const data = doc.data();

        const createdAt =
          data.createdAt instanceof Date
            ? data.createdAt
            : data.createdAt?.toDate?.() ?? new Date();

        return ReviewSchema.parse({
          id: data.id ?? doc.id,
          userName: data.userName,
          rating: data.rating,
          headline: data.headline ?? data.title,
          comment: data.comment ?? data.message,
          createdAt,
        });
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "FIREBASE_NOT_CONFIGURED"
      ) {
        console.warn("Firebase not configured, using sample reviews");
      } else {
        console.error("Error fetching reviews:", error);
      }

      // Return sample reviews for development
      return [
        {
          id: "review-1",
          userName: "Kabilan",
          rating: 5,
          headline: "Value for money",
          comment: "Value for money",
          createdAt: new Date("2025-04-10"),
        },
        {
          id: "review-2",
          userName: "Jerry",
          rating: 5,
          headline: "go9od",
          comment: "very comfortable",
          createdAt: new Date("2025-09-21"),
        },
        {
          id: "review-3",
          userName: "Sarah M",
          rating: 4,
          headline: "Great quality mattress",
          comment:
            "Really happy with this purchase. The memory foam is comfortable and provides good support.",
          createdAt: new Date("2025-03-15"),
        },
        {
          id: "review-4",
          userName: "Mike Chen",
          rating: 5,
          headline: "Excellent for back pain",
          comment:
            "My back pain has significantly reduced since switching to this mattress. Highly recommend!",
          createdAt: new Date("2025-02-28"),
        },
        {
          id: "review-5",
          userName: "Lisa K",
          rating: 4,
          headline: "Good value",
          comment:
            "Quality mattress at a reasonable price. Delivery was quick and setup was easy.",
          createdAt: new Date("2025-01-12"),
        },
        {
          id: "review-6",
          userName: "David R",
          rating: 5,
          headline: "Best sleep ever",
          comment:
            "I've been sleeping so much better since getting this mattress. The orthopedic support is amazing.",
          createdAt: new Date("2025-01-05"),
        },
      ] as Review[];
    }
  }
);
