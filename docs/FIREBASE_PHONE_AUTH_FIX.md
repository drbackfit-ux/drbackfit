# Firebase Phone Authentication Error Fix

## Error: `auth/invalid-app-credential`

This error occurs when Firebase Phone Authentication is not properly configured. Follow these steps to fix it.

---

## Step 1: Enable Phone Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **dr-backfit**
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Phone** provider
5. Click **Enable**
6. Save the changes

---

## Step 2: Configure Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Add the following domains:
   - `localhost` (for local development)
   - Your production domain (when deploying)
3. Click **Add domain** and save

---

## Step 3: Set Up reCAPTCHA for Phone Auth

Firebase Phone Authentication uses **reCAPTCHA Enterprise** or **App Check** for verification.

### Option A: Use Firebase App Check (Recommended for Production)

1. Go to Firebase Console → **App Check**
2. Click **Get Started**
3. Register your web app
4. Choose **reCAPTCHA Enterprise** or **reCAPTCHA v3**
5. Follow the setup instructions
6. Copy the **Site Key** provided

### Option B: Use Standard reCAPTCHA (For Development/Testing)

For development, Firebase automatically uses an invisible reCAPTCHA. However, you need to ensure:

1. Your Firebase project is properly configured
2. The domain is authorized (see Step 2)
3. You're using the correct Firebase configuration

---

## Step 4: Update Environment Variables

The reCAPTCHA site key in `.env.local` appears to be a test key. For Firebase Phone Auth, you **don't need** to manually configure reCAPTCHA keys - Firebase handles this automatically.

**Remove or comment out these lines from `.env.local`:**

```env
# These are NOT needed for Firebase Phone Auth
# NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LecbCssAAAAAFIFlIxfEwSEKAIn4dIwL2gjZXk9
# secret_recaptcha_key=6LecbCssAAAAANrpJiD7OPzPYUm1gmolH5smEzX7
```

Firebase automatically handles reCAPTCHA for phone authentication.

---

## Step 5: Verify RecaptchaVerifier Implementation ✅

**GOOD NEWS**: The RecaptchaVerifier implementation has been fixed!

The correct Firebase v9+ modular SDK syntax is:
```typescript
new RecaptchaVerifier(auth, containerId, parameters)
```

This has been updated in `src/services/auth.service.ts`.

---

## Step 6: Verify Firebase Configuration

Ensure your Firebase configuration in `.env.local` is correct:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDf5t7t2-9Iuxq-KrH9lKViqlE7HlM0y-E
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dr-backfit.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dr-backfit
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dr-backfit.firebasestorage.app
NEXT_PUBLIC_FIREBASE_APP_ID=1:1066231784781:web:2860ea99243d8601cbc304
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1066231784781
```

---

## Step 7: Test Phone Authentication

1. Restart your development server: `npm run dev`
2. Navigate to the sign-up page
3. Enter phone number in international format: `+919981693954`
4. Click "Send OTP"
5. Check for any console errors

---

## Additional Debugging Steps

If the error persists:

1. **Check Browser Console** for detailed error messages
2. **Verify Phone Number Format**: Must be in E.164 format (e.g., `+919981693954`)
3. **Check Firebase Quotas**: Ensure you haven't exceeded SMS quota
4. **Enable Test Phone Numbers** (for development):
   - Go to Firebase Console → Authentication → Sign-in method → Phone
   - Scroll to "Phone numbers for testing"
   - Add test numbers with verification codes

---

## Common Issues and Solutions

### Issue: "reCAPTCHA client element has been removed"
**Solution**: Ensure the `recaptcha-container` div exists in your DOM before calling `setupRecaptcha()`

### Issue: "Invalid format"
**Solution**: Phone number must be in E.164 format with country code (e.g., `+919981693954`)

### Issue: "Quota exceeded"
**Solution**: Firebase has daily SMS limits. Use test phone numbers for development.

---

## Testing with Test Phone Numbers

For development without consuming SMS quota:

1. Go to Firebase Console → Authentication → Sign-in method → Phone
2. Add test phone numbers:
   - Phone: `+919999999999`
   - Code: `123456`
3. Use these in development to avoid SMS charges

---

## Next Steps

After completing these steps:
1. The `auth/invalid-app-credential` error should be resolved
2. Phone authentication should work correctly
3. You can proceed with testing the complete sign-up flow
