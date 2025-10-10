import "server-only";

import { env } from "@/config/env.mjs";
import { App, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

const hasAdminConfig = () =>
  Boolean(
    env.FIREBASE_PROJECT_ID &&
      env.FIREBASE_CLIENT_EMAIL &&
      env.FIREBASE_PRIVATE_KEY &&
      env.FIREBASE_STORAGE_BUCKET
  );

let adminApp: App | undefined;

export const getFirebaseAdminApp = (): App => {
  if (!hasAdminConfig()) {
    throw new Error(
      "Firebase Admin SDK is not configured. Please set FIREBASE_* env variables."
    );
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

export const getFirebaseAdminDb = (): Firestore => getFirestore(getFirebaseAdminApp());
export const getFirebaseAdminStorage = (): Storage => getStorage(getFirebaseAdminApp());
