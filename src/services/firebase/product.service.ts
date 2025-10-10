import "server-only";

import { cache } from "react";
import type {
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { ProductDetail, ProductDetailSchema } from "@/models/ProductDetail";
import { Product, ProductSchema } from "@/models/Product";
import { Review, ReviewSchema } from "@/models/Review";
import { getFirebaseAdminDb } from "@/lib/firebase/server";
import { prepareProductPayload } from "@/utils/product-normalizer";
import seedData from "@/data/seed-data.json";

const PRODUCTS_COLLECTION = "products";
const REVIEWS_SUBCOLLECTION = "reviews";

const normalizeProductDocument = (
  doc: QueryDocumentSnapshot<DocumentData>
) => prepareProductPayload(doc.data(), doc.id);

const parseProduct = (doc: QueryDocumentSnapshot<DocumentData>) => {
  const normalized = normalizeProductDocument(doc);
  return ProductSchema.parse(normalized);
};

const parseProductDetail = (doc: QueryDocumentSnapshot<DocumentData>) => {
  const normalized = normalizeProductDocument(doc);
  return ProductDetailSchema.parse(normalized);
};

export const fetchAllProductSlugs = cache(async (): Promise<string[]> => {
  try {
    const db = getFirebaseAdminDb();
    const snapshot = await db.collection(PRODUCTS_COLLECTION).select("slug").get();
    return snapshot.docs
      .map((doc) => doc.data()?.slug as string | undefined)
      .filter((slug): slug is string => Boolean(slug));
  } catch {
    return seedData.products.map((p) => p.slug);
  }
});

const toProductDetailFallback = (product: Product): ProductDetail => {
  const discount = Math.max(0, Math.round(
    ((product.priceEstimateMax - product.priceEstimateMin) / product.priceEstimateMax) * 100
  ));

  // Generate multiple images for better gallery experience
  const generateProductImages = (baseImage: string, category: string) => {
    const images = [baseImage]; // Start with the original image
    
    // Add category-specific additional images
    if (category === 'beds') {
      images.push(
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop", // Bedroom lifestyle
        "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&h=600&fit=crop", // Bed detail
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop", // Side angle
        "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&h=600&fit=crop"  // Room setting
      );
    } else if (category === 'sofas') {
      images.push(
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop", // Living room lifestyle
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop", // Sofa detail
        "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&h=600&fit=crop", // Different angle
        "https://images.unsplash.com/photo-1615875605825-5eb9bb5d52ac?w=800&h=600&fit=crop"  // Room context
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
      savingsAmount: Math.max(0, product.priceEstimateMax - product.priceEstimateMin),
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
    sizeOptions: product.category === "mattresses" ? [
      { label: "Single (90x190cm)", value: "single", inStock: true, isDefault: false },
      { label: "Queen (150x190cm)", value: "queen", inStock: true, isDefault: true },
      { label: "King (180x200cm)", value: "king", inStock: true, isDefault: false },
    ] : undefined,
    offers: [
      { title: "Bank Offer", description: "10% off for set in all purchases over ₹899 selected partner", icon: "%" },
      { title: "Partner Offer", description: "Buy 2 items save 5%/ Buy 3 items save 10%. Only on partner products", icon: "%" },
      { title: "No Cost EMI", description: "Bajaj Finserv EMI Card starting at ₹960.88 for 6 months. Only valid on select cards", icon: "₹" },
    ],
    delivery: { placeholder: "Enter pincode", ctaLabel: "Check", helperText: "Enter pincode to check delivery date" },
    videoShopping: {
      title: "Video Shopping",
      description: "Start video shopping with our Expert",
      ctaLabel: "Book Now",
      ctaHref: "/contact",
      imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=250&fit=crop",
    },
    serviceHighlights: [
      { title: "Free delivery", description: "Across major cities", icon: "truck" },
      { title: "Warranty", description: "Up to 2 years", icon: "warranty" },
    ],
    detailSections: [
      { id: "specs", title: "Product specifications", content: product.materials },
      { id: "dimensions", title: "Dimensions", content: [
        `Width: ${product.dimensions.w} cm`,
        `Depth: ${product.dimensions.d} cm`,
        `Height: ${product.dimensions.h} cm`,
      ]},
      { id: "warranty", title: "Warranty", content: ["1 year manufacturing warranty"]},
    ],
    warranty: { title: "Warranty policy", description: "1 year manufacturing warranty" },
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: product.category, href: `/catalog?category=${product.category}` },
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
      { id: "f1", question: "Is installation included?", answer: "Yes, basic installation is included in delivery." },
    ],
  });
};

export const fetchProductDetailBySlug = cache(
  async (slug: string): Promise<ProductDetail | null> => {
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

      return parseProductDetail(snapshot.docs[0]);
    } catch {
      const base = seedData.products.find((p) => p.slug === slug);
      if (!base) return null;
      const parsedBase = ProductSchema.parse(base);
      return toProductDetailFallback(parsedBase);
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
    } catch {
      return seedData.products
        .filter((p) => p.category === category && p.id !== excludeProductId)
        .slice(0, limit)
        .map((p) => ProductSchema.parse(p));
    }
  }
);

export const fetchProductReviews = cache(
  async (productId: string, limitCount = 6): Promise<Review[]> => {
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
    } catch {
      // Return sample reviews for development
      return [
        {
          id: "review-1",
          userName: "Kabilan",
          rating: 5,
          headline: "Value for money",
          comment: "Value for money",
          createdAt: new Date("2025-04-10")
        },
        {
          id: "review-2", 
          userName: "Jerry",
          rating: 5,
          headline: "go9od",
          comment: "very comfortable",
          createdAt: new Date("2025-09-21")
        },
        {
          id: "review-3",
          userName: "Sarah M",
          rating: 4,
          headline: "Great quality mattress",
          comment: "Really happy with this purchase. The memory foam is comfortable and provides good support.",
          createdAt: new Date("2025-03-15")
        },
        {
          id: "review-4",
          userName: "Mike Chen",
          rating: 5,
          headline: "Excellent for back pain",
          comment: "My back pain has significantly reduced since switching to this mattress. Highly recommend!",
          createdAt: new Date("2025-02-28")
        },
        {
          id: "review-5",
          userName: "Lisa K",
          rating: 4,
          headline: "Good value",
          comment: "Quality mattress at a reasonable price. Delivery was quick and setup was easy.",
          createdAt: new Date("2025-01-12")
        },
        {
          id: "review-6",
          userName: "David R",
          rating: 5,
          headline: "Best sleep ever",
          comment: "I've been sleeping so much better since getting this mattress. The orthopedic support is amazing.",
          createdAt: new Date("2025-01-05")
        }
      ] as Review[];
    }
  }
);
