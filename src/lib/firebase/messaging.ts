"use client";

import { getToken, isSupported, getMessaging } from "firebase/messaging";
import { firebaseApp, isFirebaseConfigured } from "@/lib/firebase/client";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export const isPushConfigured = Boolean(
  isFirebaseConfigured && VAPID_KEY,
);

/**
 * Register the FCM service worker (passing the public config via query string,
 * since a static SW file can't read build-time env vars) and return an FCM token.
 * Returns null when push isn't available/permitted.
 */
export async function requestPushToken(): Promise<string | null> {
  if (!isPushConfigured || !firebaseApp) return null;
  if (typeof window === "undefined") return null;
  if (!(await isSupported().catch(() => false))) return null;
  if (!("serviceWorker" in navigator)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const cfg = firebaseApp.options;
  const params = new URLSearchParams({
    apiKey: String(cfg.apiKey ?? ""),
    authDomain: String(cfg.authDomain ?? ""),
    projectId: String(cfg.projectId ?? ""),
    storageBucket: String(cfg.storageBucket ?? ""),
    messagingSenderId: String(cfg.messagingSenderId ?? ""),
    appId: String(cfg.appId ?? ""),
  });

  const registration = await navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?${params.toString()}`,
  );

  const messaging = getMessaging(firebaseApp);
  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  return token || null;
}
