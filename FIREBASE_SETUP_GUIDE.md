# Firebase Firestore & Cloudinary Integration Setup Guide

This guide will help you set up Firebase Firestore and Cloudinary integration for your Dr Backfit Atelier e-commerce project.

## 🔥 Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firestore Database (choose "Start in test mode" for now)
4. In Firestore, create a collection named `products`

### Step 2: Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. In the "Your apps" section, add a web app
3. Copy the Firebase config object
4. Go to Project Settings > Service Accounts
5. Generate a new private key (download the JSON file)

### Step 3: Configure Environment Variables

Update your `.env.local` file with the Firebase configuration:

```bash
# Firebase Client Configuration (from web app config)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here

# Firebase Admin Configuration (from service account JSON)
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
```

## ☁️ Cloudinary Setup

### Step 1: Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and create a free account
2. Go to your dashboard to get your credentials

### Step 2: Create Upload Preset

1. In Cloudinary Dashboard, go to Settings > Upload
2. Create an unsigned upload preset named `drbackfit_products`
3. Set the folder to `products`
4. Enable the preset

### Step 3: Configure Environment Variables

Add Cloudinary configuration to your `.env.local`:

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## 📁 Firestore Database Structure

Your Firestore `products` collection should have documents with this structure:

```javascript
{
  title: "Product Title",
  description: "Detailed product description",
  shortDescription: "Brief description (optional)",
  category: "beds" | "sofas" | "couches" | "custom" | "accessories",
  price: 2500,
  stock: 10,
  imageUrls: [
    "https://res.cloudinary.com/your_cloud/image/upload/v1234567890/products/image1.jpg",
    "https://res.cloudinary.com/your_cloud/image/upload/v1234567890/products/image2.jpg"
  ],
  section: "featured" | "trending" | "new_arrival" | "offers" | "home_page",
  isActive: true,
  sku: "BED-001",
  slug: "product-title-slug",
  materials: ["Solid Oak", "Premium Linen"],
  dimensions: {
    w: 180,
    h: 120,
    d: 210
  },
  leadTimeDays: 28,
  isCustomAllowed: true,
  tags: ["Bestseller", "Custom-Made"],
  createdAt: Firestore.Timestamp,
  updatedAt: Firestore.Timestamp
}
```

## 🚀 How to Use

### Admin Panel

1. Navigate to `/admin` in your application
2. The admin panel now includes:
   - **Add Product**: Click "Add Product" button to create new products
   - **Edit Product**: Click edit icon to modify existing products
   - **Delete Product**: Click delete icon to remove products
   - **Image Upload**: Drag & drop or select images (automatically uploads to Cloudinary)
   - **Section Management**: Choose where products appear (Featured, Trending, etc.)

### Frontend Integration

Products will automatically be fetched from Firestore and displayed on:
- Home page (products with section = "home_page")
- Featured section (products with section = "featured")
- Trending section (products with section = "trending")
- New arrivals (products with section = "new_arrival")
- Offers (products with section = "offers")

### API Endpoints

The following API endpoints are available:

- `GET /api/products` - Get all products
- `GET /api/products?section=featured` - Get products by section
- `GET /api/products?category=beds` - Get products by category
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product
- `POST /api/cloudinary/delete` - Delete image from Cloudinary

## 🔧 Development Workflow

1. **Add Products**: Use the admin panel to add products with images
2. **Configure Sections**: Assign products to different display sections
3. **Test Frontend**: Visit different pages to see products displayed
4. **Update Inventory**: Manage stock levels through the admin panel

## 📝 Notes

- Images are automatically optimized and stored in Cloudinary
- Products are cached for better performance
- The system falls back to static data if Firebase is not configured
- All operations include proper error handling and validation
- The admin panel provides real-time feedback for all operations

## 🐛 Troubleshooting

1. **Firebase Connection Issues**: Check your environment variables
2. **Image Upload Fails**: Verify Cloudinary upload preset is unsigned and enabled
3. **Products Not Displaying**: Check Firestore rules and product `isActive` status
4. **Build Errors**: Ensure all environment variables are properly set

## 🔒 Security

- Firestore rules should be configured for production
- Cloudinary API keys should be kept secure
- Consider implementing authentication for admin operations

This setup provides a complete e-commerce product management system with image handling and dynamic content management!
