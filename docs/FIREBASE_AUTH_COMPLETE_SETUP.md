# 🔐 Firebase Authentication Setup Guide

Complete step-by-step guide to set up Firebase Authentication with Email OTP and Phone OTP for Dr Backfit.

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Firebase account (https://console.firebase.google.com)
- ✅ Google account for reCAPTCHA
- ✅ Project running locally (`npm run dev`)
- ✅ Access to `.env.local` file

---

## 🚀 Step 1: Enable Firebase Authentication

### 1.1 Access Firebase Console

1. Go to **[Firebase Console](https://console.firebase.google.com/)**
2. Select your project (or create a new one if needed)
3. Click on **"Authentication"** in the left sidebar
4. Click **"Get Started"** button

### 1.2 What You'll See

You'll see the Authentication dashboard with:
- Sign-in method tab
- Users tab
- Templates tab
- Settings tab

---

## 📧 Step 2: Enable Email/Password Provider

### 2.1 Enable Email Authentication

1. In the **Authentication** page, click on **"Sign-in method"** tab
2. Find **"Email/Password"** in the list of providers
3. Click on **"Email/Password"**
4. Toggle **"Enable"** switch to ON
5. **Important:** Keep "Email link (passwordless sign-in)" DISABLED (we're using password-based auth)
6. Click **"Save"**

### 2.2 Verification

You should see:
- ✅ Email/Password status: **Enabled**
- ✅ Green checkmark next to Email/Password

---

## 📱 Step 3: Enable Phone Provider

### 3.1 Enable Phone Authentication

1. Still in the **"Sign-in method"** tab
2. Find **"Phone"** in the list of providers
3. Click on **"Phone"**
4. Toggle **"Enable"** switch to ON
5. Click **"Save"**

### 3.2 Add Test Phone Numbers (Optional but Recommended)

For development/testing without using real SMS:

1. Scroll down to **"Phone numbers for testing"**
2. Click **"Add phone number"**
3. Add test numbers:
   ```
   Phone: +1 650-555-1234
   Code: 123456
   
   Phone: +91 9876543210
   Code: 654321
   ```
4. Click **"Add"**
5. Click **"Save"**

### 3.3 Verification

You should see:
- ✅ Phone status: **Enabled**
- ✅ Test phone numbers added (if you added them)

---

## 🔒 Step 4: Configure reCAPTCHA for Phone Auth

### 4.1 Get reCAPTCHA Site Key

1. Go to **[Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)**
2. Click **"+"** to create a new site
3. Fill in the form:
   ```
   Label: Dr Backfit - Phone Auth
   reCAPTCHA type: reCAPTCHA v3
   Domains: 
     - localhost
     - your-domain.com (add your production domain)
   ```
4. Accept the terms
5. Click **"Submit"**

### 4.2 Copy Your Keys

You'll see two keys:
- **Site Key** (starts with `6L...`) - This is what you need
- **Secret Key** - Keep this secure (not needed for client-side)

### 4.3 Add to Environment Variables

1. Open your `.env.local` file
2. Add the reCAPTCHA site key:
   ```bash
   # Add this line
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc...your-site-key-here
   ```
3. Save the file
4. **Restart your dev server** for changes to take effect:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

### 4.4 Verification

- ✅ reCAPTCHA site created
- ✅ Site key copied
- ✅ Added to `.env.local`
- ✅ Dev server restarted

---

## 🗄️ Step 5: Set Up Firestore Database

### 5.1 Create Firestore Database

1. In Firebase Console, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose a location:
   - Select a location close to your users
   - **Recommended:** `us-central1` (or your region)
4. Choose starting mode:
   - Select **"Start in test mode"** for development
   - We'll add proper security rules next
5. Click **"Enable"**

Wait 1-2 minutes for the database to be created.

### 5.2 Verification

You should see:
- ✅ Firestore Database created
- ✅ Empty database with no collections yet
- ✅ "Start collection" button visible

---

## 🛡️ Step 6: Add Firestore Security Rules

### 6.1 Access Security Rules

1. In **Firestore Database**, click on the **"Rules"** tab
2. You'll see the default test mode rules

### 6.2 Replace with Production Rules

**Delete all existing rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      // Anyone authenticated can read their own user document
      allow read: if isOwner(userId);
      
      // Users can create their own profile during signup
      allow create: if isAuthenticated() 
                    && request.auth.uid == userId
                    && request.resource.data.uid == userId
                    && request.resource.data.isActive == true;
      
      // Users can update their own profile
      allow update: if isOwner(userId)
                    && request.resource.data.uid == userId
                    && request.resource.data.isActive == resource.data.isActive;
      
      // Nobody can delete user profiles
      allow delete: if false;
    }
    
    // Products collection (read-only for all users)
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // Only admins via Admin SDK
    }
    
    // Orders collection (users can only access their own orders)
    match /orders/{orderId} {
      allow read: if isAuthenticated() 
                  && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated()
                    && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }
    
    // Cart collection (users can only access their own cart)
    match /carts/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Wishlist collection (users can only access their own wishlist)
    match /wishlists/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Default: deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 6.3 Publish Rules

1. Click **"Publish"** button
2. Wait for confirmation message
3. Rules are now active!

### 6.4 Verification

- ✅ Security rules published
- ✅ No syntax errors
- ✅ Rules are active

---

## 🔐 Step 7: Configure Authorized Domains

### 7.1 Add Localhost for Development

1. Go to **Authentication** → **Settings** tab
2. Scroll to **"Authorized domains"**
3. You should see `localhost` already added
4. If not, click **"Add domain"** and add:
   ```
   localhost
   ```

### 7.2 Add Production Domain (When Ready)

When deploying to production:
1. Click **"Add domain"**
2. Add your production domain:
   ```
   your-domain.com
   www.your-domain.com
   ```
3. Click **"Add"**

### 7.3 Verification

- ✅ `localhost` is in the authorized domains list
- ✅ Production domains added (if deploying)

---

## ✅ Step 8: Verify Environment Variables

### 8.1 Check Your `.env.local` File

Ensure you have all required Firebase variables:

```bash
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789

# Firebase Admin Configuration (for server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# reCAPTCHA (for phone auth)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc...your-site-key-here
```

### 8.2 Get Missing Values

If you're missing any values:

**Firebase Client Config:**
1. Go to Firebase Console → Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click on your web app (or add one if none exists)
4. Copy the config values

**Firebase Admin Config:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Copy values from the JSON to `.env.local`

### 8.3 Restart Dev Server

After updating `.env.local`:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

---

## 🧪 Step 9: Test Email Signup Flow

### 9.1 Start Testing

1. Open your browser to **http://localhost:3000/sign-up**
2. You should see the signup page

### 9.2 Test Email OTP Signup

**Step 1: Choose Method**
1. Click on **"Email OTP"** card
2. You should see the form appear

**Step 2: Fill Details**
```
First Name: Test
Last Name: User
Email: test@example.com (use a real email you can access)
Password: Test1234
Confirm Password: Test1234
☑ I agree to the terms and conditions
```

**Step 3: Submit**
1. Click **"Create Account"** button
2. You should see:
   - Loading spinner
   - Success message: "Verification email sent!"
   - Redirect to success screen

**Step 4: Verify Email**
1. Check your email inbox
2. Open the verification email from Firebase
3. Click the verification link
4. Your email is now verified!

**Step 5: Check Firestore**
1. Go to Firebase Console → Firestore Database
2. You should see a new collection: `users`
3. Click on it to see your user document
4. Verify the data:
   ```javascript
   {
     uid: "firebase-generated-id",
     email: "test@example.com",
     firstName: "Test",
     lastName: "User",
     displayName: "Test User",
     authMethod: "email",
     emailVerified: false, // Will be true after clicking verification link
     phoneVerified: false,
     phoneNumber: null,
     photoURL: null,
     isActive: true,
     createdAt: Timestamp,
     updatedAt: Timestamp,
     lastLoginAt: Timestamp
   }
   ```

### 9.3 Expected Results

✅ **Success Indicators:**
- Form submits without errors
- Success toast message appears
- User redirected to success screen
- User document created in Firestore
- Verification email received
- No console errors

❌ **Common Issues:**

**"Firebase: Error (auth/operation-not-allowed)"**
- **Fix:** Enable Email/Password provider in Firebase Console

**"Firebase: Error (auth/invalid-api-key)"**
- **Fix:** Check `NEXT_PUBLIC_FIREBASE_API_KEY` in `.env.local`

**"Permission denied" in Firestore**
- **Fix:** Check Firestore security rules are published

**No verification email received**
- **Fix:** Check spam folder, verify email templates in Firebase Console

---

## 📱 Step 10: Test Phone Signup Flow

### 10.1 Test with Test Phone Number

**Step 1: Choose Method**
1. Go to **http://localhost:3000/sign-up**
2. Click on **"Phone OTP"** card

**Step 2: Fill Details**
```
First Name: Phone
Last Name: Test
Country Code: +1 (US/CA)
Phone Number: 6505551234 (the test number we added)
Password: Test1234
Confirm Password: Test1234
☑ I agree to the terms and conditions
```

**Step 3: Send OTP**
1. Click **"Send OTP"** button
2. reCAPTCHA will verify (invisible)
3. You should see:
   - Success message: "OTP sent to your phone!"
   - OTP input screen appears

**Step 4: Enter OTP**
1. Enter the test code: `123456`
2. OTP will auto-submit when complete
3. You should see:
   - Success message: "Account created successfully!"
   - Redirect to success screen

**Step 5: Check Firestore**
1. Go to Firebase Console → Firestore Database → users
2. You should see a new user document
3. Verify the data:
   ```javascript
   {
     uid: "firebase-generated-id",
     phoneNumber: "+16505551234",
     firstName: "Phone",
     lastName: "Test",
     displayName: "Phone Test",
     authMethod: "phone",
     emailVerified: false,
     phoneVerified: true,
     email: null,
     photoURL: null,
     isActive: true,
     createdAt: Timestamp,
     updatedAt: Timestamp,
     lastLoginAt: Timestamp
   }
   ```

### 10.2 Test with Real Phone Number

**⚠️ Warning:** This will send a real SMS and count against your quota!

1. Use your real phone number
2. Select correct country code
3. Click "Send OTP"
4. Check your phone for SMS
5. Enter the 6-digit code received
6. Complete signup

### 10.3 Expected Results

✅ **Success Indicators:**
- reCAPTCHA verifies successfully
- OTP sent message appears
- OTP input screen shows
- OTP verification succeeds
- User document created in Firestore
- No console errors

❌ **Common Issues:**

**"reCAPTCHA verification failed"**
- **Fix:** Check `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` in `.env.local`
- **Fix:** Add `localhost` to reCAPTCHA domains
- **Fix:** Clear browser cache and try again

**"Firebase: Error (auth/operation-not-allowed)"**
- **Fix:** Enable Phone provider in Firebase Console

**"Firebase: Error (auth/invalid-phone-number)"**
- **Fix:** Use format: +[country code][number] (e.g., +16505551234)

**"Firebase: Error (auth/quota-exceeded)"**
- **Fix:** You've exceeded free SMS quota (10/day)
- **Fix:** Use test phone numbers instead
- **Fix:** Upgrade to Blaze plan

**"Too many requests"**
- **Fix:** Wait a few minutes before trying again
- **Fix:** Use test phone numbers for development

---

## 🔑 Step 11: Test Login Flow

### 11.1 Test Email Login

1. Go to **http://localhost:3000/sign-in**
2. Enter credentials:
   ```
   Email: test@example.com
   Password: Test1234
   ```
3. Click **"Sign In"**
4. You should be redirected to `/account`
5. Check browser console - no errors

### 11.2 Test Phone Login

**Note:** Phone login requires the user to have signed up with phone first.

1. Go to **http://localhost:3000/sign-in**
2. Currently, the sign-in page only supports email/password
3. For phone login, users would need to use the phone signup flow

### 11.3 Verify Session

1. After logging in, check browser DevTools → Application → Local Storage
2. You should NOT see user data in localStorage (we removed that)
3. Firebase manages the session via secure tokens
4. Refresh the page - you should stay logged in

### 11.4 Test Logout

1. Navigate to your account page
2. Click logout button
3. You should be redirected to home/login
4. Session should be cleared

---

## 🐛 Step 12: Troubleshooting Guide

### Common Issues & Solutions

#### Issue 1: "Module not found" errors
**Solution:**
```bash
npm install
# or
bun install
```

#### Issue 2: TypeScript errors
**Solution:**
```bash
npm run type-check
```
Fix any errors shown.

#### Issue 3: Firebase initialization errors
**Solution:**
1. Check all environment variables are set
2. Restart dev server
3. Clear `.next` cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

#### Issue 4: reCAPTCHA not showing
**Solution:**
1. Check console for errors
2. Verify `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set
3. Add `localhost` to authorized domains in reCAPTCHA admin
4. Clear browser cache

#### Issue 5: Firestore permission denied
**Solution:**
1. Verify security rules are published
2. Check user is authenticated
3. Verify `uid` matches in rules

#### Issue 6: Email verification not working
**Solution:**
1. Check Firebase Console → Authentication → Templates
2. Verify email templates are enabled
3. Check spam folder
4. Try with different email provider

---

## ✅ Step 13: Final Verification Checklist

### Firebase Console Checklist

- [ ] ✅ Authentication enabled
- [ ] ✅ Email/Password provider enabled
- [ ] ✅ Phone provider enabled
- [ ] ✅ Test phone numbers added (optional)
- [ ] ✅ reCAPTCHA configured
- [ ] ✅ Firestore database created
- [ ] ✅ Security rules published
- [ ] ✅ Authorized domains configured

### Environment Variables Checklist

- [ ] ✅ `NEXT_PUBLIC_FIREBASE_API_KEY` set
- [ ] ✅ `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` set
- [ ] ✅ `NEXT_PUBLIC_FIREBASE_PROJECT_ID` set
- [ ] ✅ `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` set
- [ ] ✅ `NEXT_PUBLIC_FIREBASE_APP_ID` set
- [ ] ✅ `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` set
- [ ] ✅ `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` set
- [ ] ✅ Dev server restarted after changes

### Testing Checklist

- [ ] ✅ Email signup works
- [ ] ✅ Email verification email received
- [ ] ✅ Phone signup works (test number)
- [ ] ✅ OTP received and verified
- [ ] ✅ User document created in Firestore
- [ ] ✅ Email login works
- [ ] ✅ Session persists on refresh
- [ ] ✅ Logout works
- [ ] ✅ No console errors

### Code Checklist

- [ ] ✅ `npm run type-check` passes
- [ ] ✅ `npm run lint` passes
- [ ] ✅ No TypeScript errors
- [ ] ✅ Dev server running without errors

---

## 📊 Step 14: Monitor & Maintain

### Monitor Authentication

1. **Firebase Console → Authentication → Users**
   - View all registered users
   - See sign-in methods
   - Disable/delete users if needed

2. **Firebase Console → Authentication → Usage**
   - Monitor authentication requests
   - Track SMS quota usage
   - View error rates

### Monitor Firestore

1. **Firebase Console → Firestore Database → Data**
   - View user documents
   - Check data integrity
   - Monitor document count

2. **Firebase Console → Firestore Database → Usage**
   - Track reads/writes
   - Monitor storage usage
   - View quota limits

### Best Practices

1. **Security:**
   - Never commit `.env.local` to git
   - Rotate API keys periodically
   - Monitor for suspicious activity

2. **Testing:**
   - Use test phone numbers for development
   - Test with multiple email providers
   - Test on different devices/browsers

3. **Production:**
   - Upgrade to Blaze plan before launch
   - Set up proper error logging (Sentry, etc.)
   - Monitor Firebase quotas
   - Set up alerts for quota limits

---

## 🎉 Success!

If you've completed all steps and all checkboxes are marked, your Firebase Authentication is fully set up and ready to use!

### What's Next?

1. **Customize Email Templates** (Optional)
   - Go to Authentication → Templates
   - Customize verification email design
   - Add your branding

2. **Add More Features** (Optional)
   - Password reset functionality
   - Email change functionality
   - Phone number change functionality
   - Two-factor authentication

3. **Deploy to Production**
   - Update environment variables for production
   - Add production domain to Firebase
   - Test in production environment

---

## 📞 Support

If you encounter issues not covered in this guide:

1. Check Firebase documentation: https://firebase.google.com/docs/auth
2. Check console for error messages
3. Review Firestore security rules
4. Verify all environment variables

---

**🎊 Congratulations! Your Firebase Authentication is now fully configured!** 🎊
