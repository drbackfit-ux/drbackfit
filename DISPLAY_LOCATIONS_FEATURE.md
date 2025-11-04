# Display Locations Feature

## Overview
Added a new feature to control where products appear on the website through checkboxes in the admin panel.

## What Was Added

### 1. **Product Model Update** (`ProductDetail.ts`)
Added a new `displayLocations` field to the ProductDetail model:

```typescript
displayLocations: {
  homeBestseller: boolean,  // Show in Best Seller section on homepage
  homeFeatured: boolean,     // Show in Featured Products section on homepage
  catalog: boolean,          // Show in Catalog page
  accessories: boolean,      // Show in Accessories page
}
```

**Default values:**
- `homeBestseller`: `false`
- `homeFeatured`: `false`
- `catalog`: `true` (shown by default)
- `accessories`: `false`

### 2. **Admin Form Update** (`ProductDetailFormStreamlined.tsx`)
Added a new "Display Locations" section in the admin product form with 4 toggle switches:

- ✅ **Home - Best Seller Section**: Show product in bestseller section on homepage
- ✅ **Home - Featured Products Section**: Show product in featured products section on homepage
- ✅ **Catalog Page**: Show product in main catalog/products page
- ✅ **Accessories Page**: Show product in accessories page

The section appears right after "Basic Information" and before "Product Images" in the form.

### 3. **Product Service Updates** (`products.service.ts`)
Updated the following functions to respect display locations:

#### `getFeaturedProducts()`
- Now filters products with `displayLocations.homeFeatured === true`
- Fallback: Shows first 4 products if none marked as featured

#### `getBestsellerProducts()`
- Now filters products with `displayLocations.homeBestseller === true`
- Fallback: Shows products with "Bestseller" tag if none marked

#### New: `getCatalogProducts()`
- Filters products with `displayLocations.catalog !== false`
- Returns all products that should appear in catalog page

#### New: `getAccessoriesProducts()`
- Filters products with `displayLocations.accessories === true`
- Fallback: Shows products with "accessories" category

### 4. **Parser Update** (`product.service.ts`)
Updated `parseProductDetail` to include default `displayLocations` values when parsing products from Firestore.

## How to Use

### Creating a New Product
1. Go to Admin Panel → Products → Add New Product
2. Fill in product details
3. In the "Display Locations" section, toggle the switches:
   - Turn ON "Home - Best Seller Section" to show in bestseller section
   - Turn ON "Home - Featured Products Section" to show in featured section
   - Turn ON "Catalog Page" to show in catalog (ON by default)
   - Turn ON "Accessories Page" to show in accessories page
4. Click "Save Product"

### Updating Existing Products
1. Go to Admin Panel → Products → Click Edit on any product
2. Scroll to "Display Locations" section
3. Toggle the switches as needed
4. Click "Update Product"

## Examples

### Example 1: Premium Bed (Featured on Homepage)
```
Display Locations:
✅ Home - Best Seller Section: OFF
✅ Home - Featured Products Section: ON
✅ Catalog Page: ON
✅ Accessories Page: OFF
```
This bed will appear in:
- Featured Products section on homepage
- Catalog page

### Example 2: Bestselling Sofa
```
Display Locations:
✅ Home - Best Seller Section: ON
✅ Home - Featured Products Section: OFF
✅ Catalog Page: ON
✅ Accessories Page: OFF
```
This sofa will appear in:
- Best Seller section on homepage
- Catalog page

### Example 3: Cushion Accessory
```
Display Locations:
✅ Home - Best Seller Section: OFF
✅ Home - Featured Products Section: OFF
✅ Catalog Page: OFF
✅ Accessories Page: ON
```
This cushion will appear in:
- Accessories page only

### Example 4: Hidden Product (Unlisted)
```
Display Locations:
✅ Home - Best Seller Section: OFF
✅ Home - Featured Products Section: OFF
✅ Catalog Page: OFF
✅ Accessories Page: OFF
```
This product will:
- Still be accessible via direct URL
- Not appear in any listing pages

## Technical Notes

- All toggle switches use the shadcn/ui `Switch` component
- Changes are saved to Firestore in the `displayLocations` field
- Existing products without this field will get default values when loaded
- The feature is backward compatible - old products will still work
- Firestore initialization is ensured before querying products

## Files Modified

1. `src/models/ProductDetail.ts` - Added `ProductDisplayLocationsSchema` and type
2. `src/components/admin/ProductDetailFormStreamlined.tsx` - Added UI section with toggles
3. `src/services/firebase/product.service.ts` - Added default values in parser
4. `src/services/products.service.ts` - Updated fetch functions + added new functions

## Testing Checklist

- [ ] Create new product with display locations
- [ ] Update existing product's display locations
- [ ] Verify product appears in selected sections on frontend
- [ ] Verify product doesn't appear in unselected sections
- [ ] Test with all toggles OFF
- [ ] Test with all toggles ON
- [ ] Test homepage bestseller section
- [ ] Test homepage featured section
- [ ] Test catalog page
- [ ] Test accessories page
