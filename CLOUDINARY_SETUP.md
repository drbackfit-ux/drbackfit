# Cloudinary Setup Verification

## ✅ Your Cloudinary Configuration

**Cloud Name**: `drla1ls5a`  
**Upload Preset**: `drbackfit`  
**Folder**: `products/`

## 🔧 Required Cloudinary Dashboard Settings

To enable unsigned uploads (required for the admin panel):

### Step 1: Go to Cloudinary Dashboard
👉 https://cloudinary.com/console

### Step 2: Navigate to Settings
1. Click on the ⚙️ **Settings** icon (top right)
2. Go to **Upload** tab
3. Scroll to **Upload presets** section

### Step 3: Create/Verify Upload Preset

#### If preset "drbackfit" doesn't exist:
1. Click **Add upload preset**
2. Set **Preset name**: `drbackfit`
3. Set **Signing mode**: **Unsigned** ⚠️ (IMPORTANT!)
4. Set **Folder**: `products`
5. Optional settings:
   - **Allowed formats**: jpg, png, webp
   - **Max file size**: 5 MB
   - **Unique filename**: Yes
   - **Overwrite**: No
6. Click **Save**

#### If preset "drbackfit" exists:
1. Click on **drbackfit** preset
2. Verify **Signing mode**: Must be **Unsigned**
3. Verify **Folder**: Should be `products` (optional but recommended)
4. Click **Save** if you made changes

### Step 4: Verify Settings
```
✓ Cloud Name: drla1ls5a
✓ Preset Name: drbackfit
✓ Signing Mode: Unsigned
✓ Folder: products (optional)
```

## 🧪 Test Upload

1. Go to `/admin` in your app
2. Click **Products** tab
3. Click **Add New Product**
4. Click **Upload Images** button
5. Select an image file (max 5MB)
6. Watch for upload progress
7. Image should appear in preview grid

## 📸 How Images Are Stored

Images will be uploaded to:
```
https://res.cloudinary.com/drla1ls5a/image/upload/v{version}/products/{filename}
```

Example:
```
https://res.cloudinary.com/drla1ls5a/image/upload/v1699000000/products/luxury-bed-main.jpg
```

## ⚠️ Common Issues

### Error: "Upload preset not found"
**Solution**: Create the preset in Cloudinary dashboard (see Step 3)

### Error: "Upload preset must be unsigned"
**Solution**: Edit preset, change Signing mode to "Unsigned"

### Error: "Invalid cloud name"
**Solution**: Verify cloud name is `drla1ls5a` in .env.local

### Images upload but don't show
**Solution**: Check browser console, verify image URLs are valid

### Upload very slow
**Solution**: 
- Check file size (max 5MB recommended)
- Check internet connection
- Cloudinary free tier has rate limits

## 🎯 Environment Variables

Your `.env.local` file should have:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=drla1ls5a
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=drbackfit
```

## 📊 Cloudinary Free Tier Limits

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month
- **Rate Limit**: 500 requests/hour

Should be sufficient for:
- ~2,500 product images (at ~10 MB each)
- ~1,000 page views/month (with image optimization)

## 🔐 Security Note

**Unsigned upload presets** allow client-side uploads without authentication.
This is safe because:
- Upload folder is restricted to `products/`
- File size is limited to 5MB
- Only images are allowed
- Admin panel requires authentication

For production, consider:
- Adding upload rate limiting
- Implementing server-side upload
- Using signed uploads for sensitive content

## 📞 Next Steps

1. ✅ Verify Cloudinary preset is "unsigned"
2. ✅ Restart dev server (already done)
3. ✅ Test image upload in admin panel
4. ✅ Check uploaded images in Cloudinary dashboard
5. ✅ Verify images display on product page

## 🎉 You're Ready!

Once the upload preset is set to "unsigned" in Cloudinary dashboard, your admin panel will work perfectly!

Go to: **http://localhost:3000/admin** → Products → Add New Product → Upload Images
