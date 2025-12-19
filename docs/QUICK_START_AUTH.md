# 🚀 Quick Start - Firebase Auth Setup

**Fast track guide for setting up Firebase Authentication**

---

## ⚡ 5-Minute Setup

### 1. Firebase Console (2 minutes)

```
1. Go to: https://console.firebase.google.com
2. Select your project
3. Authentication → Get Started
4. Enable "Email/Password" ✅
5. Enable "Phone" ✅
6. Add test phone: +1 650-555-1234, Code: 123456
```

### 2. reCAPTCHA (1 minute)

```
1. Go to: https://www.google.com/recaptcha/admin
2. Create site → reCAPTCHA v3
3. Add domain: localhost
4. Copy Site Key (6Lc...)
5. Add to .env.local:
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc...
```

### 3. Firestore (1 minute)

```
1. Firestore Database → Create database
2. Start in test mode
3. Rules tab → Copy rules from full guide
4. Publish
```

### 4. Test (1 minute)

```
1. npm run dev
2. Go to: http://localhost:3000/sign-up
3. Click "Phone OTP"
4. Use test number: +1 650-555-1234
5. Enter code: 123456
6. Success! ✅
```

---

## 📋 Environment Variables Needed

```bash
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=

# Firebase Admin (optional for now)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

**Get these from:**
- Firebase Console → Project Settings → Your apps
- reCAPTCHA Admin → Your site

---

## 🧪 Quick Test Commands

```bash
# Type check
npm run type-check

# Run dev server
npm run dev

# Test signup
Open: http://localhost:3000/sign-up

# Test login
Open: http://localhost:3000/sign-in
```

---

## 🐛 Quick Fixes

**"Operation not allowed"**
→ Enable Email/Password or Phone in Firebase Console

**"reCAPTCHA failed"**
→ Check NEXT_PUBLIC_RECAPTCHA_SITE_KEY in .env.local

**"Permission denied"**
→ Publish Firestore security rules

**"Invalid phone number"**
→ Use format: +16505551234

---

## ✅ Success Checklist

- [ ] Email/Password enabled in Firebase
- [ ] Phone provider enabled in Firebase
- [ ] Test phone number added
- [ ] reCAPTCHA site created
- [ ] Site key in .env.local
- [ ] Firestore database created
- [ ] Security rules published
- [ ] Dev server restarted
- [ ] Email signup tested ✅
- [ ] Phone signup tested ✅
- [ ] Login tested ✅

---

## 📚 Full Guide

For detailed instructions, see:
**[FIREBASE_AUTH_COMPLETE_SETUP.md](./FIREBASE_AUTH_COMPLETE_SETUP.md)**

---

**Ready in 5 minutes!** ⚡
