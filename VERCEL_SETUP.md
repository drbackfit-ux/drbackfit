# Vercel Deployment Setup

## Required Environment Variables

To deploy this application on Vercel, you **MUST** configure the following environment variables in your Vercel project settings:

### 1. Firebase Admin (Required)

These are required for fetching product data from Firestore:

```
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

**How to get these values:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Copy values from the JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and \n characters)
   - For `FIREBASE_STORAGE_BUCKET`, use: `your-project-id.appspot.com`

### 2. Cloudinary (Required for Admin Image Upload)

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**How to get these values:**

1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Go to **Dashboard**
3. Copy the following:
   - Cloud Name → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`

### 3. Firebase Client (Optional - for auth features)

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
```

### 4. Admin Authentication

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
```

## How to Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** tab
3. Click on **Environment Variables** in the left sidebar
4. Add each variable:
   - Enter the **Key** (e.g., `FIREBASE_PROJECT_ID`)
   - Enter the **Value**
   - Select environments (Production, Preview, Development)
   - Click **Add**

## Important Notes

### Firebase Private Key

The `FIREBASE_PRIVATE_KEY` must be entered with proper formatting:

```
"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgE...\n-----END PRIVATE KEY-----\n"
```

- Keep the quotes around the entire key
- Keep the `\n` newline characters
- Do NOT remove or modify the BEGIN/END markers

### Without Firebase Configuration

If Firebase environment variables are not configured:
- Products will not load (empty arrays returned)
- Homepage will show no bestsellers/featured products
- Admin panel will show "dummy" placeholder products
- Product pages will show 404

### Without Cloudinary Configuration

If Cloudinary environment variables are not configured:
- Image uploads in admin will fail
- You'll see warning: "Cloudinary cloud name is not configured"
- Existing images will still display if they have URLs

## Testing Locally

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual values in `.env.local`

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Test that products load correctly at:
   - http://localhost:3000 (homepage)
   - http://localhost:3000/admin (admin panel)

## Troubleshooting

### Error: "Failed to fetch products"

- Check that all Firebase environment variables are set correctly
- Verify the private key has proper `\n` characters
- Ensure your Firebase service account has Firestore read/write permissions

### Error: "Cloudinary cloud name is not configured"

- Add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` to Vercel
- Verify the cloud name matches your Cloudinary account

### Products not showing in admin

- Check Vercel deployment logs for errors
- Verify Firebase credentials are correct
- Make sure Firestore has products in the `productDetails` collection
