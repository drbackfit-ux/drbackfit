# 🌐 Firebase Phone Auth - URL Configuration Guide

## ⚠️ Important: Phone OTP URL Requirements

**Yes, Phone OTP has different requirements for local vs production URLs!**

---

## 🔍 The Issue Explained

### Why Phone OTP is Different

Firebase Phone Authentication uses **reCAPTCHA** which has strict domain requirements:

1. **Local Development:**
   - Works on `localhost` ✅
   - Works on `127.0.0.1` ✅
   - **Does NOT work on local IP** (e.g., `192.168.1.100`) ❌

2. **Production:**
   - Requires a **real domain** (e.g., `yourdomain.com`) ✅
   - Requires **HTTPS** (SSL certificate) ✅
   - **Does NOT work on HTTP** in production ❌

3. **Testing on Mobile Devices:**
   - **Cannot test phone OTP** on mobile using local IP ❌
   - Must use **ngrok** or similar tunneling service ✅
   - Or deploy to a **staging environment** ✅

---

## 📱 Problem Scenarios

### ❌ Won't Work:

```bash
# Testing on mobile device using local IP
http://192.168.1.100:3000  # reCAPTCHA will fail ❌

# Production without HTTPS
http://yourdomain.com  # reCAPTCHA will fail ❌

# Using IP address in production
http://123.45.67.89  # reCAPTCHA will fail ❌
```

### ✅ Will Work:

```bash
# Local development on same computer
http://localhost:3000  ✅

# Using ngrok for mobile testing
https://abc123.ngrok.io  ✅

# Production with proper domain
https://yourdomain.com  ✅
```

---

## 🛠️ Solutions for Different Scenarios

### Solution 1: Local Development (Desktop Only)

**Use `localhost` - No changes needed!**

```bash
# Your current setup works fine
npm run dev
# Open: http://localhost:3000
```

**Environment Variables:**
```bash
# .env.local - No URL changes needed for localhost
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
# ... other variables
```

**Authorized Domains in Firebase:**
- `localhost` ✅ (already added)

---

### Solution 2: Testing on Mobile Devices (Development)

**Use ngrok to create a public HTTPS URL**

#### Step 1: Install ngrok

```bash
# Download from: https://ngrok.com/download
# Or install via npm
npm install -g ngrok
```

#### Step 2: Start ngrok

```bash
# In a new terminal, run:
ngrok http 3000

# You'll get a URL like:
# https://abc123-xyz.ngrok.io
```

#### Step 3: Add ngrok URL to Firebase

1. Go to **Firebase Console** → **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Click **Add domain**
4. Add your ngrok URL (without `https://`):
   ```
   abc123-xyz.ngrok.io
   ```
5. Click **Add**

#### Step 4: Add ngrok URL to reCAPTCHA

1. Go to **[reCAPTCHA Admin](https://www.google.com/recaptcha/admin)**
2. Select your site
3. Click **Settings** (gear icon)
4. Add domain:
   ```
   abc123-xyz.ngrok.io
   ```
5. Save

#### Step 5: Test on Mobile

```bash
# Your dev server is still running on localhost
npm run dev

# ngrok is tunneling to it
# Open on mobile: https://abc123-xyz.ngrok.io
```

**⚠️ Note:** ngrok URLs change every time you restart ngrok (free plan). You'll need to update Firebase and reCAPTCHA each time.

---

### Solution 3: Production Deployment

**Use a real domain with HTTPS**

#### Required Setup:

1. **Domain Name:**
   - Purchase a domain (e.g., from Namecheap, GoDaddy)
   - Or use free subdomain from Vercel/Netlify

2. **HTTPS Certificate:**
   - Automatically provided by Vercel/Netlify ✅
   - Or use Let's Encrypt for custom hosting

3. **Environment Variables:**

```bash
# .env.production (or Vercel environment variables)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
# ... other variables
```

4. **Add Domain to Firebase:**

```
Firebase Console → Authentication → Settings → Authorized domains
Add: yourdomain.com
```

5. **Add Domain to reCAPTCHA:**

```
reCAPTCHA Admin → Your site → Settings
Add: yourdomain.com
```

---

## 🔧 Code Changes Required

### Option 1: No Code Changes (Recommended)

**Our current implementation works for both local and production!**

The code automatically uses the current domain:
- On `localhost` → reCAPTCHA uses localhost
- On `yourdomain.com` → reCAPTCHA uses yourdomain.com

**No changes needed in:**
- `src/services/auth.service.ts` ✅
- `src/context/AuthContext.tsx` ✅
- `src/app/sign-up/page.tsx` ✅

---

### Option 2: Add Environment-Based Configuration (Optional)

If you want to be explicit about URLs:

#### 1. Add to `.env.local`:

```bash
# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 2. Add to `.env.production`:

```bash
# Production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### 3. Update `src/services/auth.service.ts`:

```typescript
// Add this at the top
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 
                (typeof window !== 'undefined' ? window.location.origin : '');

// Use it if needed (though not required for reCAPTCHA)
console.log('App URL:', APP_URL);
```

**But this is NOT required** - Firebase automatically detects the domain!

---

## 📋 Complete Setup Checklist

### For Local Development:

- [ ] ✅ `localhost` added to Firebase authorized domains
- [ ] ✅ `localhost` added to reCAPTCHA domains
- [ ] ✅ Dev server running on `http://localhost:3000`
- [ ] ✅ Phone OTP works on desktop browser

### For Mobile Testing (Development):

- [ ] ✅ ngrok installed
- [ ] ✅ ngrok running (`ngrok http 3000`)
- [ ] ✅ ngrok URL added to Firebase authorized domains
- [ ] ✅ ngrok URL added to reCAPTCHA domains
- [ ] ✅ Phone OTP tested on mobile device

### For Production:

- [ ] ✅ Domain purchased or Vercel domain configured
- [ ] ✅ HTTPS enabled (automatic on Vercel)
- [ ] ✅ Production domain added to Firebase authorized domains
- [ ] ✅ Production domain added to reCAPTCHA domains
- [ ] ✅ Environment variables set in production
- [ ] ✅ Phone OTP tested in production

---

## 🧪 Testing Strategy

### Phase 1: Desktop Development
```bash
# Test on localhost
npm run dev
# Open: http://localhost:3000/sign-up
# Test phone OTP ✅
```

### Phase 2: Mobile Development (Optional)
```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: ngrok
ngrok http 3000

# Add ngrok URL to Firebase & reCAPTCHA
# Test on mobile: https://abc123.ngrok.io/sign-up
```

### Phase 3: Staging/Production
```bash
# Deploy to Vercel
vercel deploy

# Test on production URL
# https://yourdomain.com/sign-up
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "reCAPTCHA verification failed" on mobile

**Cause:** Using local IP address (e.g., `192.168.1.100`)

**Solution:**
- Use ngrok for mobile testing
- Or deploy to staging environment
- Or test on desktop using localhost

### Issue 2: "This domain is not authorized"

**Cause:** Domain not added to Firebase authorized domains

**Solution:**
1. Go to Firebase Console → Authentication → Settings
2. Add your domain to authorized domains
3. Wait 1-2 minutes for changes to propagate

### Issue 3: ngrok URL changes every restart

**Cause:** Free ngrok plan generates random URLs

**Solution:**
- Upgrade to ngrok paid plan for static URLs
- Or use Vercel preview deployments instead
- Or just update Firebase/reCAPTCHA each time (quick)

### Issue 4: Phone OTP works on localhost but not production

**Cause:** Production domain not added to reCAPTCHA or Firebase

**Solution:**
1. Add production domain to Firebase authorized domains
2. Add production domain to reCAPTCHA admin
3. Ensure HTTPS is enabled
4. Clear browser cache and test again

---

## 🚀 Recommended Workflow

### For Development:

```bash
# 1. Develop on localhost (desktop)
npm run dev
# Test: http://localhost:3000

# 2. When you need to test on mobile:
# Terminal 1:
npm run dev

# Terminal 2:
ngrok http 3000

# 3. Add ngrok URL to Firebase & reCAPTCHA
# 4. Test on mobile
```

### For Production:

```bash
# 1. Deploy to Vercel
vercel deploy

# 2. Add production domain to Firebase
# 3. Add production domain to reCAPTCHA
# 4. Test on production URL
```

---

## 📝 Environment Variables Summary

### `.env.local` (Development)
```bash
# No URL needed - localhost works automatically
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
```

### `.env.production` (Production)
```bash
# Optional - same variables as above
# Vercel will use these automatically
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
```

**No URL changes needed!** Firebase detects the domain automatically.

---

## ✅ Summary

### Key Points:

1. **Phone OTP requires proper domains:**
   - ✅ `localhost` for local development
   - ✅ `https://` domains for production
   - ❌ Local IP addresses won't work

2. **No code changes needed:**
   - Our implementation works for both local and production
   - Firebase automatically detects the domain

3. **For mobile testing:**
   - Use ngrok to create HTTPS tunnel
   - Or deploy to staging environment
   - Or wait until production deployment

4. **For production:**
   - Use a real domain with HTTPS
   - Add domain to Firebase authorized domains
   - Add domain to reCAPTCHA admin

### You're Already Set Up! ✅

Your current code works for both local and production. Just make sure to:
1. Add domains to Firebase authorized domains
2. Add domains to reCAPTCHA admin
3. Use HTTPS in production

**No URL-related code changes required!** 🎉

---

## 📞 Need Help?

- Check Firebase Console for authorized domains
- Check reCAPTCHA admin for domain settings
- Verify HTTPS is enabled in production
- Test on `localhost` first before mobile

---

**Your phone OTP will work perfectly on both local and production with proper domain configuration!** 🚀
