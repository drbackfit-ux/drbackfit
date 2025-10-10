"use client";

import { clientEnv } from "@/config/client-env";
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const requiredConfig = {
  apiKey: clientEnv.FIREBASE.API_KEY,
  authDomain: clientEnv.FIREBASE.AUTH_DOMAIN,
  projectId: clientEnv.FIREBASE.PROJECT_ID,
  storageBucket: clientEnv.FIREBASE.STORAGE_BUCKET,
  messagingSenderId: clientEnv.FIREBASE.MESSAGING_SENDER_ID,
  appId: clientEnv.FIREBASE.APP_ID,
};

const assertClientConfig = () => {
  const missing = Object.entries(requiredConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase client configuration values: ${missing.join(", ")}`
    );
  }
};

export const getFirebaseClientApp = (): FirebaseApp => {
  assertClientConfig();

  if (getApps().length > 0) {
    return getApp();
  }

  const config = requiredConfig as Required<typeof requiredConfig>;

  return initializeApp({
    ...config,
    measurementId: clientEnv.FIREBASE.MEASUREMENT_ID,
  });
};

export const getFirebaseClientDb = () => getFirestore(getFirebaseClientApp());

export const getFirebaseClientStorage = () =>
  getStorage(getFirebaseClientApp());
