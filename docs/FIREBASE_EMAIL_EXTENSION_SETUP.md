# Firebase Email Extension Setup Guide

This guide explains how to set up the **Firebase Trigger Email Extension** for sending order notification emails automatically.

## Prerequisites

- Firebase project with Firestore enabled
- SMTP credentials (SendGrid, Mailgun, or Gmail)

---

## Step 1: Install Firebase Extension

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Extensions** in the left sidebar
4. Click **Explore Extensions**
5. Search for **"Trigger Email"**
6. Click **Install**

---

## Step 2: Configure Extension

During installation, you'll be prompted to configure:

### Collection Path
```
mail
```

### SMTP Connection URI

**For SendGrid:**
```
smtps://apikey:YOUR_SENDGRID_API_KEY@smtp.sendgrid.net:465
```

**For Mailgun:**
```
smtps://postmaster@YOUR_DOMAIN:YOUR_PASSWORD@smtp.mailgun.org:465
```

**For Gmail (not recommended for production):**
```
smtps://your-email@gmail.com:YOUR_APP_PASSWORD@smtp.gmail.com:465
```

> ⚠️ **Gmail Note**: You need to enable 2FA and create an App Password at https://myaccount.google.com/apppasswords

### Default From Address
```
FarmsCraft <noreply@farmscraft.com>
```

### Default Reply-To Address (optional)
```
support@farmscraft.com
```

---

## Step 3: Update Firestore Rules

Add these rules to allow the extension to read/write the `mail` collection:

```javascript
// In firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ... your existing rules ...
    
    // Mail collection - allow server-side writes only
    match /mail/{document=**} {
      allow read, write: if false; // Only Firebase Admin SDK can access
    }
  }
}
```

---

## Step 4: Test the Setup

### Option A: Manual Test via Firebase Console

1. Go to **Firestore Database** in Firebase Console
2. Create a new collection called `mail`
3. Add a document with this structure:

```json
{
  "to": "your-test-email@example.com",
  "message": {
    "subject": "Test Email from FarmsCraft",
    "html": "<h1>Hello!</h1><p>This is a test email.</p>",
    "text": "Hello! This is a test email."
  }
}
```

4. The extension will process it automatically
5. Check the document's `delivery` field for status

### Option B: Test via Application

1. Place a test order through the checkout flow
2. Check Firestore → `mail` collection for new document
3. Verify email received

---

## Email Document Structure

When order emails are sent, documents are added like this:

```typescript
{
  to: "customer@email.com",
  message: {
    subject: "Order Confirmed 🎉 - #FC-2024-001234",
    html: "<html>...</html>",
    text: "Plain text version..."
  },
  createdAt: Timestamp,
  // After processing, extension adds:
  delivery: {
    state: "SUCCESS" | "ERROR" | "PENDING",
    startTime: Timestamp,
    endTime: Timestamp,
    attempts: number,
    error: string | null
  }
}
```

---

## SMTP Provider Recommendations

| Provider | Free Tier | Best For |
|----------|-----------|----------|
| **SendGrid** | 100 emails/day | Production, scaling |
| **Mailgun** | 5,000/month (3 months) | Good deliverability |
| **Gmail** | 500 emails/day | Development/testing only |

### SendGrid Setup

1. Create account at [sendgrid.com](https://sendgrid.com/)
2. Go to **Settings** → **API Keys**
3. Create API Key with **Full Access**
4. Use format: `smtps://apikey:YOUR_KEY@smtp.sendgrid.net:465`
5. Verify sender domain for better deliverability

---

## Monitoring & Debugging

### Check Email Status

View the `mail` collection in Firestore:
- `delivery.state: "SUCCESS"` - Email sent successfully
- `delivery.state: "ERROR"` - Failed, check `delivery.error`
- `delivery.state: "PENDING"` - Still processing

### Common Issues

1. **Authentication Failed**
   - Verify SMTP credentials
   - Check for special characters in password (URL-encode them)

2. **Emails Going to Spam**
   - Set up SPF, DKIM, DMARC for your domain
   - Verify sender domain with your SMTP provider

3. **Extension Not Processing**
   - Check Firebase Extension logs in Cloud Functions
   - Verify extension is enabled and configured

---

## Security Notes

- SMTP credentials are stored securely in Firebase Extension settings
- The `mail` collection should be server-write-only (admin SDK)
- Don't expose email service functions to client-side code

