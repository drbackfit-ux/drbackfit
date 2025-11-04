# Dr. Backfit Admin Setup Guide

## ✅ Configuration Complete

### Firebase Configuration
- **Project ID**: dr-backfit
- **API Key**: Configured ✓
- **Auth Domain**: dr-backfit.firebaseapp.com
- **Storage Bucket**: dr-backfit.firebasestorage.app
- **Collections**: Auto-created on first use

### Cloudinary Configuration
- **Cloud Name**: drla1ls5a ✓
- **Upload Preset**: drbackfit ✓
- **Folder**: products/

### Auto-Created Collections
The system will automatically create these Firestore collections:
1. **productDetails** - Product catalog (created when first product added)
2. **orders** - Customer orders (ready to use)
3. **customers** - Customer data (ready to use)
4. **reviews** - Product reviews (ready to use)

## 🚀 How to Use Admin Product Management

### Adding a New Product

1. **Access Admin Panel**
   - Navigate to `/admin`
   - Go to "Products" tab

2. **Click "Add New Product"**
   - Fill in basic information:
     - Product Title (e.g., "Luxury King Size Bed")
     - Slug (URL-friendly, e.g., "luxury-king-size-bed")
     - Category (Beds, Sofas, Couches, etc.)
     - Short Description

3. **Upload Images**
   - Click "Upload Images" button
   - Select multiple images (max 5MB each)
   - First image becomes main product image
   - Others become thumbnails
   - Images automatically uploaded to Cloudinary

4. **Set Rating**
   - Average Rating: 0-5 stars (displayed below title)
   - Review Count: Number of reviews

5. **Configure Pricing**
   - MRP (₹): Original price
   - Sale Price (₹): Discounted price
   - Discount %: Auto-calculated
   - Optional: Coupon code & price
   - Optional: EMI text

6. **Stock Status**
   - Toggle "In Stock" switch
   - Set stock label (e.g., "In Stock", "Limited Stock")

7. **Add Size Options** (Dropdown on product page)
   - Label: Display text (e.g., "King Size")
   - Value: Size value (e.g., "72x84")
   - In Stock: Toggle availability
   - Default: Mark default selection

8. **Add Offers** (Visible in savings card)
   - Title: Offer name (e.g., "Bank Offer")
   - Description: Offer details
   - Multiple offers supported

9. **Add Service Highlights** (Icon cards below product)
   - Title: Service name (e.g., "Free Installation")
   - Description: Service details
   - Icon: Icon name (truck, shield-check, warranty, etc.)

10. **Product Specifications**
    - Dimensions: Width × Height × Depth (cm)
    - Materials: Add multiple materials (Wood, Fabric, etc.)

11. **Add Features** (Accordion sections)
    - Section Title: (e.g., "Description", "Features")
    - Content Points: Add multiple feature points

12. **Care Instructions**
    - Long Description: Detailed care guide

13. **Warranty** (Optional)
    - Title: (e.g., "10 Year Warranty")
    - Description: Warranty details

14. **Add FAQs** (FAQ section)
    - Question: Customer question
    - Answer: Detailed answer
    - Multiple FAQs supported

15. **Delivery Configuration**
    - Placeholder: Input placeholder text
    - Button Label: CTA button text

16. **Click "Create Product"**
    - Product saved to Firebase Firestore
    - Collection auto-created if first product
    - Product appears in products list

### Editing a Product

1. Click "Edit" button on any product
2. Modify any fields
3. Upload new images or remove existing ones
4. Click "Update Product"

### Deleting a Product

1. Click "Delete" button on any product
2. Confirm deletion
3. Product removed from Firestore

## 📁 Firestore Data Structure

### Collection: `productDetails`
```
productDetails/
├── {productId}/
│   ├── title: string
│   ├── slug: string
│   ├── category: string
│   ├── images: string[]
│   ├── pricing: {
│   │   mrp: number
│   │   salePrice: number
│   │   discountPercent: number
│   │   savingsAmount: number
│   │   couponCode?: string
│   │   couponPrice?: number
│   │   emiText?: string
│   │   taxInclusiveLabel: string
│   │   currency: string
│   │ }
│   ├── rating: {
│   │   average: number
│   │   count: number
│   │ }
│   ├── stockStatus: {
│   │   label: string
│   │   subLabel?: string
│   │   inStock: boolean
│   │ }
│   ├── sizeOptions: [{
│   │   label: string
│   │   value: string
│   │   inStock: boolean
│   │   isDefault?: boolean
│   │ }]
│   ├── offers: [{
│   │   title: string
│   │   description: string
│   │   icon?: string
│   │   ctaLabel?: string
│   │ }]
│   ├── serviceHighlights: [{
│   │   title: string
│   │   description: string
│   │   icon: string
│   │ }]
│   ├── detailSections: [{
│   │   id: string
│   │   title: string
│   │   content: string[]
│   │ }]
│   ├── dimensions: {
│   │   w: number
│   │   h: number
│   │   d: number
│   │ }
│   ├── materials: string[]
│   ├── longDescription: string
│   ├── warranty?: {
│   │   title: string
│   │   description: string
│   │ }
│   ├── faqs: [{
│   │   id: string
│   │   question: string
│   │   answer: string
│   │ }]
│   ├── delivery: {
│   │   placeholder: string
│   │   ctaLabel: string
│   │   helperText?: string
│   │ }
│   ├── createdAt: Timestamp
│   └── updatedAt: Timestamp
```

## 🔄 Future Collections (Ready to Use)

### Orders Collection
```typescript
// Ready to implement when needed
orders/
├── orderId: string
├── customerId: string
├── products: [{productId, quantity, price}]
├── totalAmount: number
├── status: string
├── createdAt: Timestamp
└── deliveryAddress: object
```

### Customers Collection
```typescript
// Ready to implement when needed
customers/
├── customerId: string
├── name: string
├── email: string
├── phone: string
├── orders: string[]
└── createdAt: Timestamp
```

### Reviews Collection
```typescript
// Ready to implement when needed
reviews/
├── reviewId: string
├── productId: string
├── customerId: string
├── rating: number
├── comment: string
└── createdAt: Timestamp
```

## 🎯 Frontend Display Mapping

Every field in the form maps directly to what users see:

| Form Field | Frontend Display |
|------------|------------------|
| Title | Product title at top |
| Images | Main image + thumbnail gallery |
| Rating | Stars with count below title |
| MRP / Sale Price | Price section with discount |
| Size Options | Dropdown selector |
| Offers | Expandable savings card |
| Service Highlights | Icon cards (4-column grid) |
| Detail Sections | Accordion features |
| Dimensions | Product specifications |
| Materials | Product specifications |
| Long Description | Care instructions section |
| Warranty | Warranty section |
| FAQs | FAQ accordion |
| Delivery | Pincode check input |

## ⚠️ Important Notes

1. **No Unnecessary Fields**: Form only includes fields visible on product page
2. **Auto-Calculations**: Discount % and savings auto-update
3. **Cloudinary Upload**: No URL inputs - direct file upload
4. **Auto-Collection Creation**: Firestore creates collections automatically
5. **Fallback Data**: System falls back to seed-data.json if Firebase unavailable
6. **Image Validation**: Max 5MB per image, multiple images supported
7. **Icon Names**: Use lucide-react icon names (truck, shield-check, warranty, etc.)

## 🐛 Troubleshooting

### Images Not Uploading
- Check Cloudinary cloud name: drla1ls5a
- Check upload preset: drbackfit
- Ensure preset is "unsigned" in Cloudinary dashboard
- Check file size (max 5MB)

### Firebase Connection Issues
- Verify .env.local has correct Firebase credentials
- Check Firebase project is active
- Ensure Firestore is enabled in Firebase console
- System automatically falls back to seed data

### Form Not Saving
- Check browser console for errors
- Verify all required fields filled
- Check Firebase connection
- Verify API routes working (/api/product-details)

## 🚀 Next Steps

1. **Test Adding Product**: Try adding your first product
2. **Verify Display**: Check product page at `/product/[slug]`
3. **Add More Products**: Build your catalog
4. **Implement Orders**: Use same pattern for orders collection
5. **Add Reviews**: Use same pattern for reviews collection

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify .env.local configuration
3. Check Firebase console for collection creation
4. Check Cloudinary dashboard for uploaded images
