/**
 * Sample data for testing Firebase integration
 * Run this script to populate your Firestore with test products
 */

import { productService } from '../src/services/client/product-client.service';

const sampleProducts = [
  {
    title: "Royal Upholstered Bed",
    description: "Our Royal Upholstered Bed exemplifies the perfect marriage of comfort and craftsmanship. Each piece is meticulously handcrafted by master artisans using sustainably sourced hardwood frames and premium upholstery fabrics.",
    shortDescription: "Handcrafted luxury bed with premium upholstery",
    category: "beds",
    price: 3500,
    stock: 5,
    section: "featured" as const,
    isActive: true,
    sku: "BED-001",
    imageUrls: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
    ],
    materials: ["Solid Oak Frame", "Premium Linen", "High-Density Foam"],
    dimensions: {
      w: 180,
      h: 120,
      d: 210
    },
    leadTimeDays: 28,
    isCustomAllowed: true,
    tags: ["Bestseller", "Custom-Made"]
  },
  {
    title: "Heritage Three-Seater Sofa",
    description: "The Heritage Three-Seater is a timeless piece that brings warmth to any living space. Hand-built on a solid hardwood frame with traditional joinery techniques.",
    shortDescription: "Classic design meets modern comfort",
    category: "sofas",
    price: 4650,
    stock: 3,
    section: "trending" as const,
    isActive: true,
    sku: "SOFA-001",
    imageUrls: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop"
    ],
    materials: ["Solid Walnut Frame", "Full-Grain Leather", "Eight-Way Hand-Tied Springs"],
    dimensions: {
      w: 220,
      h: 85,
      d: 95
    },
    leadTimeDays: 35,
    isCustomAllowed: true,
    tags: ["Bestseller", "Premium"]
  },
  {
    title: "Modern Linen Sofa",
    description: "Clean lines and plush comfort define our Modern Linen Sofa. Upholstered in breathable Belgian linen, this piece offers a relaxed yet refined aesthetic perfect for modern interiors.",
    shortDescription: "Contemporary elegance in neutral tones",
    category: "sofas",
    price: 3450,
    stock: 7,
    section: "new_arrival" as const,
    isActive: true,
    sku: "SOFA-002",
    imageUrls: [
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&h=600&fit=crop"
    ],
    materials: ["Solid Birch Frame", "Belgian Linen", "High-Resilience Foam"],
    dimensions: {
      w: 200,
      h: 80,
      d: 90
    },
    leadTimeDays: 21,
    isCustomAllowed: true,
    tags: ["Custom-Made", "Modern"]
  },
  {
    title: "Executive Oak Desk",
    description: "Crafted from sustainable oak with traditional mortise and tenon joinery. This executive desk features hand-carved details and brass hardware.",
    shortDescription: "Handcrafted executive desk in solid oak",
    category: "accessories",
    price: 2200,
    stock: 2,
    section: "offers" as const,
    isActive: true,
    sku: "DESK-001",
    imageUrls: [
      "https://images.unsplash.com/photo-1586617083073-434c14b53ad8?w=800&h=600&fit=crop"
    ],
    materials: ["Solid Oak", "Brass Hardware", "Traditional Finishes"],
    dimensions: {
      w: 150,
      h: 75,
      d: 80
    },
    leadTimeDays: 21,
    isCustomAllowed: false,
    tags: ["Office", "Traditional"]
  },
  {
    title: "Artisan Dining Table",
    description: "This stunning dining table is handcrafted from a single piece of live-edge walnut. Each table is unique, celebrating the natural beauty of the wood grain.",
    shortDescription: "Live-edge walnut dining table",
    category: "custom",
    price: 4200,
    stock: 1,
    section: "home_page" as const,
    isActive: true,
    sku: "TABLE-001",
    imageUrls: [
      "https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&h=600&fit=crop"
    ],
    materials: ["Live-Edge Walnut", "Natural Oil Finish", "Steel Legs"],
    dimensions: {
      w: 240,
      h: 76,
      d: 100
    },
    leadTimeDays: 42,
    isCustomAllowed: true,
    tags: ["Artisan", "Live-Edge", "Unique"]
  }
];

async function seedProducts() {
  console.log('🌱 Starting to seed products...');
  
  try {
    for (const product of sampleProducts) {
      console.log(`📦 Adding product: ${product.title}`);
      const result = await productService.createProduct(product);
      console.log(`✅ Created product with ID: ${result.id}`);
    }
    
    console.log('🎉 All products seeded successfully!');
    
    // Fetch and display the products
    const products = await productService.getProducts();
    console.log(`📊 Total products in database: ${products.length}`);
    
    // Display products by section
    const sections = ['featured', 'trending', 'new_arrival', 'offers', 'home_page'];
    for (const section of sections) {
      const sectionProducts = await productService.getProducts({ section });
      console.log(`📂 ${section}: ${sectionProducts.length} products`);
    }
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  }
}

// Export for use in browser console or Node.js
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).seedProducts = seedProducts;
  (window as any).productService = productService;
  console.log('🔧 Seeding functions available in console: seedProducts(), productService');
} else {
  // Node.js environment
  seedProducts();
}

export { seedProducts, sampleProducts };
