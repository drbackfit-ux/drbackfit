# Firebase Admin SDK Setup - REQUIRED for Product Management

## 🚨 Current Issue
Your admin panel cannot save products because **Firebase Admin SDK** is not configured.

The error you're seeing is because:
- API routes run on the **server** (not browser)
- Server-side operations require **Firebase Admin SDK**
- Admin SDK needs **service account credentials**

## 🔧 Quick Fix - Get Service Account Key

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com/
2. Select your project: **dr-backfit**

### Step 2: Generate Service Account Key
1. Click ⚙️ **Settings** (gear icon) → **Project settings**
2. Go to **Service accounts** tab
3. Click **Generate new private key**
4. Click **Generate key** button
5. A JSON file will download (e.g., `dr-backfit-firebase-adminsdk-xxxxx.json`)

### Step 3: Extract Credentials from JSON
Open the downloaded JSON file. It looks like:
```json
{
  "type": "service_account",
  "project_id": "dr-backfit",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@dr-backfit.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

### Step 4: Update `.env.local`
Copy these values from the JSON file to your `.env.local`:

```env
# Firebase Admin Configuration (for server-side)
FIREBASE_PROJECT_ID=dr-backfit
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@dr-backfit.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...YOUR_KEY_HERE...ABCD\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=dr-backfit.firebasestorage.app
```

⚠️ **Important**: 
- Keep the double quotes around `FIREBASE_PRIVATE_KEY`
- Don't remove the `\n` characters
- Copy the ENTIRE private key including `-----BEGIN` and `-----END`

### Step 5: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 6: Test
1. Go to http://localhost:3000/admin
2. Click **Products** → **Add New Product**
3. Fill form and click **Create Product**
4. Should work now! ✅

## 📋 Complete .env.local Example

After completing the steps above, your `.env.local` should look like:

```env
# Node Environment
NODE_ENV=development

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDf5t7t2-9Iuxq-KrH9lKViqlE7HlM0y-E
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dr-backfit.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dr-backfit
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dr-backfit.firebasestorage.app
NEXT_PUBLIC_FIREBASE_APP_ID=1:1066231784781:web:2860ea99243d8601cbc304
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1066231784781
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-5TD34BQKDC

# Firebase Admin Configuration (for server-side) - ADD THESE!
FIREBASE_PROJECT_ID=dr-backfit
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@dr-backfit.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...(your key here)...ABCD\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=dr-backfit.firebasestorage.app

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=drla1ls5a
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=drbackfit
CLOUDINARY_CLOUD_NAME=drla1ls5a
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Analytics (Optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
NEXT_PUBLIC_VERCEL_ANALYTICS=false
```

## 🔐 Security Notes

### ⚠️ NEVER Commit Service Account Keys to Git!
The service account key gives full access to your Firebase project.

**Already configured in `.gitignore`:**
- `.env.local` ✓
- `.env*.local` ✓
- `*-firebase-adminsdk-*.json` ✓

**Best Practices:**
1. ✅ Keep `.env.local` in `.gitignore`
2. ✅ Never share service account JSON files
3. ✅ Use environment variables in production (Vercel, etc.)
4. ✅ Rotate keys periodically
5. ✅ Delete old keys after rotation

## 🧪 How to Verify It's Working

After adding the credentials:

### 1. Check Console Logs
When you restart the server, you should see:
```
✅ Server Firestore initialized for product-details API
```

NOT:
```
⚠️ Firebase Admin not configured
```

### 2. Test Product Creation
1. Go to admin panel
2. Add a product with all details
3. Click "Create Product"
4. Should see success message
5. Product appears in list
6. Check Firebase Console → Firestore Database
7. You should see `productDetails` collection with your product

### 3. Check Firestore in Firebase Console
1. Go to https://console.firebase.google.com/
2. Select **dr-backfit** project
3. Go to **Firestore Database**
4. You should see:
   - Collection: `productDetails`
   - Document: Your product with auto-generated ID
   - Fields: title, slug, images, pricing, etc.

## 🚀 Alternative: Client-Side Only (Not Recommended)

If you can't get the service account key right now, you can temporarily use client-side Firestore, but this is **NOT SECURE** for production:

1. Use the client SDK directly in components
2. Add Firestore security rules
3. This works but is less secure
4. **Get the service account key ASAP for production!**

## ❓ Troubleshooting

### Error: "Service account object must contain a string 'private_key' property"
**Solution**: Make sure the private key in `.env.local` has:
- Double quotes around it
- `\n` characters preserved
- Full key from `-----BEGIN` to `-----END`

### Error: "FIREBASE_NOT_CONFIGURED"
**Solution**: One or more env variables are missing:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_STORAGE_BUCKET`

Check they're all set in `.env.local`

### Server still says "Firebase Admin not configured"
**Solution**: 
1. Make sure you saved `.env.local`
2. **Restart the dev server** (env vars only load on startup)
3. Check for typos in variable names
4. Verify the private key is wrapped in quotes

### Products still not saving
**Solution**:
1. Check browser console for errors
2. Check terminal/server logs
3. Verify Cloudinary preset is "unsigned"
4. Verify all required fields are filled

## 📞 Next Steps

1. ✅ Generate service account key from Firebase Console
2. ✅ Extract `private_key` and `client_email` from JSON
3. ✅ Add to `.env.local`
4. ✅ Restart dev server
5. ✅ Test product creation
6. ✅ Verify product in Firestore Console
7. ✅ Start adding your product catalog!

---

**Need the key RIGHT NOW?**
1. Go to: https://console.firebase.google.com/project/dr-backfit/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Download JSON
4. Copy credentials to `.env.local`
5. Restart server
6. Done! 🎉
