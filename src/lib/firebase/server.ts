import "server-only";

import { env } from "@/config/env.mjs";
import { App, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

export const hasAdminConfig = () =>
  Boolean(
    env.FIREBASE_PROJECT_ID &&
    env.FIREBASE_CLIENT_EMAIL &&
    env.FIREBASE_PRIVATE_KEY &&
    env.FIREBASE_STORAGE_BUCKET
  );

let adminApp: App | undefined;

export const getFirebaseAdminApp = (): App => {
  if (!hasAdminConfig()) {
    const missing = [];
    if (!env.FIREBASE_PROJECT_ID) missing.push("FIREBASE_PROJECT_ID");
    if (!env.FIREBASE_CLIENT_EMAIL) missing.push("FIREBASE_CLIENT_EMAIL");
    if (!env.FIREBASE_PRIVATE_KEY) missing.push("FIREBASE_PRIVATE_KEY");
    if (!env.FIREBASE_STORAGE_BUCKET) missing.push("FIREBASE_STORAGE_BUCKET");

    console.error("❌ Firebase Admin Config Missing:", missing.join(", "));
    // During build time or when Firebase is not configured, throw a specific error
    // that can be caught by the calling functions
    throw new Error(`FIREBASE_NOT_CONFIGURED: Missing ${missing.join(", ")}`);
  }

  if (adminApp) return adminApp;

  if (getApps().length > 0) {
    adminApp = getApp();
    return adminApp;
  }

  const privateKey = (env.FIREBASE_PRIVATE_KEY as string).replace(/\\n/g, "\n");

  adminApp = initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID as string,
      clientEmail: env.FIREBASE_CLIENT_EMAIL as string,
      privateKey,
    }),
    storageBucket: env.FIREBASE_STORAGE_BUCKET as string,
  });

  return adminApp;
};

export const getFirebaseAdminDb = (): Firestore =>
  getFirestore(getFirebaseAdminApp());
export const getFirebaseAdminStorage = (): Storage =>
  getStorage(getFirebaseAdminApp());
