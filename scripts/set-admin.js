const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim().replace(/"/g, '');
    }
});

const projectId = env.FIREBASE_PROJECT_ID;
const clientEmail = env.FIREBASE_CLIENT_EMAIL;
const privateKey = env.FIREBASE_PRIVATE_KEY ? env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined;

if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase config in .env.local');
    process.exit(1);
}

initializeApp({
    credential: cert({
        projectId,
        clientEmail,
        privateKey,
    }),
});

const email = process.argv[2];
if (!email) {
    console.error('Please provide an email address');
    console.log('Usage: node scripts/set-admin.js <email>');
    process.exit(1);
}

async function setAdmin(email) {
    try {
        const user = await getAuth().getUserByEmail(email);

        // Set custom claim
        await getAuth().setCustomUserClaims(user.uid, { admin: true });
        console.log(`Successfully set admin custom claim for user ${email}`);

        // Update Firestore
        const db = getFirestore();
        await db.collection('users').doc(user.uid).set({
            role: 'admin'
        }, { merge: true });
        console.log(`Successfully updated Firestore role for user ${email}`);

        console.log('Done! You may need to sign out and sign back in for changes to take effect.');
        process.exit(0);
    } catch (error) {
        console.error('Error setting admin:', error);
        process.exit(1);
    }
}

setAdmin(email);
