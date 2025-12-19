# Quick Fix Checklist for Firebase Phone Auth Error

## ✅ Code Fixes (COMPLETED)
- [x] Fixed RecaptchaVerifier constructor syntax in `auth.service.ts`
- [x] Using correct Firebase v9+ modular SDK syntax

## 🔧 Firebase Console Setup (ACTION REQUIRED)

### Priority 1: Enable Phone Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **dr-backfit**
3. Navigate to: **Authentication** → **Sign-in method**
4. Find **Phone** provider
5. Click **Enable** toggle
6. Click **Save**

### Priority 2: Add Authorized Domains
1. In Firebase Console: **Authentication** → **Settings** → **Authorized domains**
2. Verify `localhost` is in the list (should be there by default)
3. If deploying, add your production domain

### Priority 3: Test Phone Numbers (Optional for Development)
To avoid SMS charges during development:

1. Go to: **Authentication** → **Sign-in method** → **Phone**
2. Scroll to **Phone numbers for testing**
3. Click **Add phone number**
4. Add:
   - Phone: `+919999999999`
   - Code: `123456`
5. Save

Now you can use `+919999999999` with code `123456` for testing without sending real SMS.

---

## 🧪 Testing Steps

After completing Firebase Console setup:

1. **Clear browser cache** (important!)
2. **Restart dev server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```
3. Navigate to: `http://localhost:3000/sign-up`
4. Fill in the form with:
   - First Name: Test
   - Last Name: User
   - Phone: `+919999999999` (test number)
   - Password: `Test@123`
5. Click **Send OTP**
6. Enter code: `123456`
7. Should successfully create account!

---

## 🐛 If Error Persists

Check browser console for specific error messages:

### Error: "auth/invalid-app-credential"
- **Cause**: Phone auth not enabled in Firebase Console
- **Fix**: Complete Priority 1 above

### Error: "auth/captcha-check-failed"
- **Cause**: reCAPTCHA verification failed
- **Fix**: 
  - Clear browser cache
  - Ensure `localhost` is in authorized domains
  - Try in incognito mode

### Error: "auth/invalid-phone-number"
- **Cause**: Phone number format incorrect
- **Fix**: Use E.164 format: `+[country code][number]`
  - Example: `+919981693954`

### Error: "auth/quota-exceeded"
- **Cause**: Too many SMS sent (daily limit)
- **Fix**: Use test phone numbers (see Priority 3)

---

## 📝 Current Configuration

Your Firebase project: **dr-backfit**
- Project ID: `dr-backfit`
- Auth Domain: `dr-backfit.firebaseapp.com`

Environment variables are correctly configured in `.env.local`.

---

## 🎯 Next Steps After Fix

Once phone authentication works:

1. Test the complete sign-up flow
2. Test OTP verification
3. Verify user profile creation in Firestore
4. Test sign-in with phone number
5. Test password reset flow

---

## 📚 Additional Resources

- [Firebase Phone Auth Docs](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase Console](https://console.firebase.google.com/)
- Detailed guide: `docs/FIREBASE_PHONE_AUTH_FIX.md`
