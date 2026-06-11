"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.appId && firebaseConfig.projectId,
);

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  _app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  _auth = getAuth(_app);
  _googleProvider = new GoogleAuthProvider();
  _googleProvider.setCustomParameters({ prompt: "select_account" });
}

export const firebaseApp = _app;
export const auth = _auth;
export const googleProvider = _googleProvider;

export function requireAuth(): Auth {
  if (!_auth) {
    throw new Error(
      "Firebase не настроен. Заполните NEXT_PUBLIC_FIREBASE_* в .env и пересоберите.",
    );
  }
  return _auth;
}

export function requireGoogleProvider(): GoogleAuthProvider {
  if (!_googleProvider) {
    throw new Error(
      "Firebase не настроен. Заполните NEXT_PUBLIC_FIREBASE_* в .env и пересоберите.",
    );
  }
  return _googleProvider;
}
