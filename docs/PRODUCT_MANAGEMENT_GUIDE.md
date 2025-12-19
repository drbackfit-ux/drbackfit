# 📦 Product Management Guide - Dr Backfit Atelier

## 🎯 Where to Add and Manage Products

Your e-commerce platform has **TWO main places** to manage products:

---

## 🏠 Option 1: Admin Dashboard (Recommended)

### 📍 Location: `http://localhost:3000/admin`

This is your **main product management interface** located on the Admin Dashboard homepage.

### ✨ Features Available:

#### **1. View All Products**
- **Section**: "Product Management" card in the main dashboard
- **What you see**: 
  - List of all products with images
  - Product title, price, and stock
  - Display section (Featured, Trending, etc.)
  - Quick action buttons (Edit, Delete)

#### **2. Add New Product** 
- **Button**: Click "Add Product" (blue button with Plus icon)
- **What happens**: Opens a modal form
- **Fields to fill**:
  - ✏️ Product Title (required)
  - 💰 Price (required)
  - 📝 Description (required)
  - 📦 Stock Quantity
  - 🏷️ Category (Beds, Sofas, Couches, Custom, Accessories)
  - 📍 Display Section (Featured, Trending, New Arrivals, Offers, Home Page)
  - ✅ Active Product checkbox

#### **3. Edit Product**
- **Button**: Click the Edit icon (pencil) next to any product
- **What happens**: Opens pre-filled form with existing product data
- **Action**: Modify any fields and click "Update Product"

#### **4. Delete Product**
- **Button**: Click the Trash icon next to any product
- **What happens**: Shows confirmation dialog
- **Action**: Confirm to permanently delete the product

#### **5. Refresh Products**
- **Button**: "Refresh" button (with circular arrow icon)
- **What happens**: Reloads the product list from Firebase/API

---

## 📄 Option 2: Dedicated Products Page (Coming Soon)

### 📍 Location: `http://localhost:3000/admin/products`

This page is currently a placeholder and will be enhanced with:
- Advanced filtering and search
- Bulk operations
- CSV import/export
- More detailed product management

**Current Status**: Shows "Product catalog management coming soon..."

---

## 🗂️ File Structure for Product Management

### **Frontend Components**:
```
src/components/admin/
├── ProductsSection.tsx         # Main product management UI (on dashboard)
├── SimpleProductForm.tsx       # Form for add/edit products
└── AdminProductForm.tsx        # Advanced form (with image upload)
```

### **Backend Services**:
```
src/services/client/
└── product-client.service.ts   # API client for product operations

src/app/api/products/
├── route.ts                    # GET all products, POST new product
└── [id]/route.ts              # GET, PUT, DELETE individual products
```

### **Data Models**:
```
src/models/
└── EcommerceProduct.ts         # Product type definitions
```

### **Firebase Integration**:
```
src/lib/
├── firebase/
│   ├── client.ts              # Firebase client config
│   └── server.ts              # Firebase admin config
├── firestore.ts               # Firestore CRUD operations
└── cloudinary.ts              # Image upload service
```

---

## 🚀 How to Use - Step by Step

### **Step 1: Access Admin Panel**
1. Navigate to: `http://localhost:3000/admin`
2. You'll see the Admin Control Center dashboard

### **Step 2: Scroll to Product Management Section**
- Look for the card titled **"Product Management"**
- It's in the middle of the dashboard page

### **Step 3: Add Your First Product**
1. Click the **"Add Product"** button (blue button with Plus icon)
2. Fill in the form:
   ```
   Title: "Royal Upholstered Bed"
   Price: 3500
   Description: "Handcrafted luxury bed..."
   Stock: 10
   Category: "beds"
   Section: "featured"
   Active: ✓ checked
   ```
3. Click **"Add Product"** button
4. You'll see a success message
5. Product appears in the list immediately

### **Step 4: Edit a Product**
1. Find the product in the list
2. Click the **Edit icon** (pencil) on the right
3. Modify any field(s)
4. Click **"Update Product"**
5. Changes are saved instantly

### **Step 5: Delete a Product**
1. Find the product in the list
2. Click the **Trash icon** (red) on the right
3. Confirm deletion in the popup
4. Product is removed from Firebase/database

### **Step 6: Control Product Display**
The **"Display Section"** field determines where products appear:
- **Featured** → Shows on Featured Products page
- **Trending** → Shows on Trending section
- **New Arrivals** → Shows on New Arrivals page
- **Offers** → Shows on Offers/Sales page
- **Home Page** → Shows on homepage hero/featured section

---

## 🎨 Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Control Center                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            [Refresh]  [Add Product]                  │  │
│  │                                                       │  │
│  │  Product Management (3 Products)                     │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │  [IMG] Royal Bed              [Edit] [Delete] │  │  │
│  │  │        $3,500 • 10 in stock • Featured        │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │  [IMG] Heritage Sofa          [Edit] [Delete] │  │  │
│  │  │        $4,650 • 3 in stock • Trending         │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Product Form Fields

### **Required Fields** ⭐
- `title` - Product name
- `description` - Detailed description
- `price` - Price in dollars
- `category` - Product category
- `section` - Where to display

### **Optional Fields**
- `stock` - Inventory quantity (default: 0)
- `shortDescription` - Brief summary
- `sku` - Stock keeping unit code
- `slug` - URL-friendly identifier
- `materials` - Array of materials used
- `dimensions` - Width, Height, Depth (cm)
- `leadTimeDays` - Manufacturing time
- `isCustomAllowed` - Allow custom orders
- `tags` - Array of tags
- `imageUrls` - Array of Cloudinary URLs
- `isActive` - Display on website

---

## 🔧 Advanced Features (Available in AdminProductForm)

If you want to use the advanced form with image upload:

### **Location**: Update `ProductsSection.tsx` to use `AdminProductForm` instead of `SimpleProductForm`

### **Additional Features**:
1. **📸 Image Upload**: Drag & drop or select images
2. **🎨 Materials Management**: Add/remove materials
3. **🏷️ Tag Management**: Add/remove tags
4. **📏 Dimensions**: Width, Height, Depth inputs
5. **⏱️ Lead Time**: Manufacturing days
6. **🔄 Custom Orders**: Toggle custom order option
7. **📊 Upload Progress**: Visual progress bar
8. **🖼️ Image Preview**: See uploaded images
9. **🗑️ Image Removal**: Delete individual images

---

## 🔌 API Endpoints

You can also manage products programmatically:

### **GET All Products**
```javascript
fetch('/api/products')
// Returns: { products: [...] }
```

### **GET Products by Section**
```javascript
fetch('/api/products?section=featured')
// Returns: { products: [...] }
```

### **POST Create Product**
```javascript
fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "Product Name",
    description: "Description",
    price: 1000,
    stock: 5,
    category: "beds",
    section: "featured",
    isActive: true
  })
})
// Returns: { id: "abc123", message: "Product created successfully" }
```

### **PUT Update Product**
```javascript
fetch('/api/products/abc123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    price: 1200,
    stock: 3
  })
})
// Returns: { message: "Product updated successfully" }
```

### **DELETE Product**
```javascript
fetch('/api/products/abc123', {
  method: 'DELETE'
})
// Returns: { message: "Product deleted successfully" }
```

---

## 📊 Product Data Flow

```
┌──────────────┐
│ Admin Panel  │
│ (Browser)    │
└──────┬───────┘
       │
       │ 1. User adds/edits product
       ▼
┌──────────────────┐
│ SimpleProductForm│
│ Form Component   │
└──────┬───────────┘
       │
       │ 2. Form submits data
       ▼
┌──────────────────────┐
│ productService       │
│ (client-side)        │
└──────┬───────────────┘
       │
       │ 3. API call
       ▼
┌──────────────────┐
│ /api/products    │
│ Next.js Route    │
└──────┬───────────┘
       │
       │ 4. Save to database
       ▼
┌──────────────────┐
│ Firebase         │
│ Firestore DB     │
└──────────────────┘
```

---

## 💡 Tips & Best Practices

### **1. Product Titles**
- Use clear, descriptive names
- Example: "Royal Upholstered King Bed" not "Bed 1"

### **2. Pricing**
- Enter price without currency symbol
- System automatically adds $ when displaying

### **3. Stock Management**
- Set stock to 0 to mark as "Out of Stock"
- Use negative numbers to allow backorders (optional)

### **4. Display Sections**
- **Featured**: Best sellers and premium products
- **Trending**: Popular items right now
- **New Arrivals**: Recently added products
- **Offers**: Discounted or sale items
- **Home Page**: Hero section products

### **5. Active Status**
- Uncheck "Active Product" to hide from customers
- Product stays in database but won't display on website

### **6. Images** (when using advanced form)
- Upload multiple images per product
- First image becomes the main/thumbnail image
- Max file size: 5MB per image
- Supported formats: JPG, PNG, WebP

---

## 🎯 Quick Reference

| Action | Location | Button/Icon |
|--------|----------|-------------|
| View Products | `/admin` | Scroll to "Product Management" |
| Add Product | Dashboard | Blue "Add Product" button |
| Edit Product | Product list | Pencil icon |
| Delete Product | Product list | Trash icon |
| Refresh List | Dashboard | Circular arrow icon |

---

## 🔍 Troubleshooting

**Q: Products not showing after adding?**
- Click the "Refresh" button
- Check if "Active Product" is checked
- Verify Firebase connection in console

**Q: Can't delete product?**
- Ensure you have proper permissions
- Check browser console for errors
- Verify product ID exists

**Q: Form won't submit?**
- Check all required fields are filled
- Verify price and stock are numbers
- Look for error messages above form

**Q: Where do deleted products go?**
- Products are permanently deleted from Firebase
- No recovery option (make sure before deleting!)

---

## 🚀 Next Steps

1. **Configure Firebase** (if not done): See `FIREBASE_SETUP_GUIDE.md`
2. **Add products** through the admin panel
3. **Test display** on frontend pages
4. **Set up Cloudinary** for image uploads
5. **Customize product fields** as needed

Your product management system is ready to use! Start adding products from the Admin Dashboard at `/admin` 🎉
