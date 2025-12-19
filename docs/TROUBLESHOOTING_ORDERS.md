# 🔧 Troubleshooting: Order Creation Failed

## The Error
```
Failed to create order
at handleSubmit (src/app/checkout/page.tsx:116:15)
```

---

## Quick Diagnosis Steps

### **Step 1: Check Browser Console**
1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Try placing an order again
4. Look for these log messages:
   - `=== Checkout: Creating Order ===`
   - `Order Data: {...}`
   - `API Response: {...}`
   - `=== Order Creation Error ===`

**What to look for:**
- If you see validation errors, check the order data format
- If you see authentication errors, check if you're signed in
- If you see server errors, check the terminal logs

---

### **Step 2: Check Server Terminal**
Look at your terminal where `npm run dev` is running. You should see:
- `=== Order Creation Request Started ===`
- `User ID from token: ...`
- `Request body received: {...}`
- `Validation passed, creating order...`
- `Order created successfully: ORD-...`

**Common Errors:**

#### **Error: "Unauthorized: Please sign in"**
**Solution:** Make sure you're logged in before placing an order.

#### **Error: "Invalid order data"**
**Solution:** Check the validation details in the console. Common issues:
- Missing required fields
- Invalid email format
- Invalid phone number format
- Cart is empty

#### **Error: Firebase Admin initialization failed**
**Solution:** Check your `.env.local` file has these variables:
```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

### **Step 3: Test Firebase Configuration**
Visit: `http://localhost:3000/api/test-firebase`

You should see:
```json
{
  "success": true,
  "message": "Firebase Admin configuration check",
  "config": {
    "hasProjectId": true,
    "hasClientEmail": true,
    "hasPrivateKey": true,
    "projectId": "your-project-id",
    "clientEmail": "firebase-adminsdk-...",
    "appsInitialized": 1
  }
}
```

**If any value is `false`:**
1. Check your `.env.local` file
2. Restart the dev server: `npm run dev`
3. Clear Next.js cache: Delete `.next` folder and restart

---

## Common Issues & Solutions

### **Issue 1: Firebase Admin Not Initialized**

**Symptoms:**
- Error mentions "Firebase Admin"
- `appsInitialized: 0` in test endpoint

**Solution:**
1. Get Firebase Admin credentials:
   - Go to Firebase Console
   - Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

2. Add to `.env.local`:
   ```env
   FIREBASE_CLIENT_EMAIL=value-from-json
   FIREBASE_PRIVATE_KEY="value-from-json-with-\n-preserved"
   ```

3. **IMPORTANT:** The private key must have `\n` as literal `\n` (not actual newlines)
   ```env
   # CORRECT:
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
   
   # WRONG:
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
   MIIE...
   -----END PRIVATE KEY-----"
   ```

4. Restart dev server

---

### **Issue 2: User Not Authenticated**

**Symptoms:**
- Error: "Unauthorized: Please sign in"
- `User ID from token: null` in logs

**Solution:**
1. Make sure you're signed in
2. Check if Firebase Auth is working
3. Try signing out and signing in again
4. Clear browser cache and cookies

---

### **Issue 3: Validation Errors**

**Symptoms:**
- Error: "Invalid order data"
- Validation details in console

**Common Validation Issues:**

#### **Missing Cart Items**
```
Error: Order must have at least one item
```
**Solution:** Add items to cart before checkout

#### **Invalid Email**
```
Error: Invalid email address
```
**Solution:** Enter a valid email in the checkout form

#### **Invalid Phone Number**
```
Error: Phone number must be at least 10 digits
```
**Solution:** Enter a valid phone number (10+ digits)

#### **Missing Address Fields**
```
Error: Address is required
```
**Solution:** Fill in all required address fields

---

### **Issue 4: Firestore Permission Denied**

**Symptoms:**
- Error mentions "permission denied" or "insufficient permissions"

**Solution:**
1. Go to Firebase Console → Firestore → Rules
2. Add these rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /orders/{orderId} {
         allow read: if request.auth != null && 
                        resource.data.userId == request.auth.uid;
         allow create: if request.auth != null && 
                          request.resource.data.userId == request.auth.uid;
       }
       match /orderCounters/{document=**} {
         allow read, write: if request.auth != null;
       }
       match /users/{userId}/orders/{orderId} {
         allow read, write: if request.auth != null && 
                               request.auth.uid == userId;
       }
     }
   }
   ```
3. Click "Publish"

---

### **Issue 5: Order Number Generation Failed**

**Symptoms:**
- Error mentions "orderCounters" or "order number"

**Solution:**
1. The `orderCounters` collection will be created automatically
2. Make sure Firestore rules allow write access to `orderCounters`
3. Check server logs for specific error

---

## Step-by-Step Debugging

### **1. Enable Detailed Logging**
The code now has detailed logging. Check:
- **Browser Console** for client-side logs
- **Terminal** for server-side logs

### **2. Test Each Component**

#### **Test 1: Firebase Config**
```
Visit: http://localhost:3000/api/test-firebase
Expected: All values should be true
```

#### **Test 2: Authentication**
```
1. Sign in to your account
2. Open browser console
3. Run: firebase.auth().currentUser
4. Should show user object
```

#### **Test 3: Cart**
```
1. Add items to cart
2. Open browser console
3. Check localStorage for cart data
```

#### **Test 4: Checkout Form**
```
1. Fill all required fields
2. Check console for validation errors
3. Submit form
```

---

## Still Not Working?

### **Collect Debug Information**

1. **Browser Console Output:**
   - Copy all console logs when placing order
   - Include both errors and info logs

2. **Server Terminal Output:**
   - Copy all terminal logs when placing order
   - Include the full error stack trace

3. **Firebase Config Test:**
   - Visit `/api/test-firebase`
   - Copy the response

4. **Order Data:**
   - Check browser console for "Order Data: {...}"
   - Copy the order data object

### **Common Quick Fixes**

1. **Restart Everything:**
   ```bash
   # Stop dev server (Ctrl+C)
   # Delete cache
   Remove-Item -Recurse -Force .next
   # Restart
   npm run dev
   ```

2. **Clear Browser Data:**
   - Clear cache and cookies
   - Hard refresh (Ctrl+Shift+R)

3. **Check Environment Variables:**
   ```bash
   # In PowerShell
   Get-Content .env.local | Select-String "FIREBASE"
   ```

4. **Verify Firebase Project:**
   - Make sure you're using the correct Firebase project
   - Check if Firestore is enabled
   - Check if Authentication is enabled

---

## Need More Help?

If you're still stuck, provide:
1. Browser console logs
2. Server terminal logs
3. Firebase config test results
4. Screenshots of the error

This will help diagnose the exact issue!
