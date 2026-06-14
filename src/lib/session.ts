import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma";
import {
  isPhoneSessionToken,
  signPhoneSession,
  verifyPhoneSession,
} from "@/lib/phone-session";
import type { Role, User } from "@prisma/client";

export const SESSION_COOKIE = "omut_session";
const LONG_SESSION_MS = 60 * 60 * 24 * 365 * 1000;
const FIREBASE_SESSION_MS = 60 * 60 * 24 * 14 * 1000;

function setSessionCookie(value: string) {
  return cookies().then((store) => {
    store.set(SESSION_COOKIE, value, {
      httpOnly: true,
      // Keep this false while the temporary IP/HTTP entrypoint is used.
      // Enable with FORCE_SECURE_COOKIES=true after HTTPS domain migration.
      secure: process.env.FORCE_SECURE_COOKIES === "true",
      sameSite: "lax",
      maxAge: LONG_SESSION_MS / 1000,
      path: "/",
    });
  });
}

/** Verify an incoming Firebase ID token, sync the DB user and set a session cookie. */
export async function createSession(idToken: string): Promise<User> {
  const decoded = await adminAuth.verifyIdToken(idToken);

  const bootstrapAdmins = (process.env.BOOTSTRAP_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const email = decoded.email?.toLowerCase() ?? null;
  const isBootstrapAdmin = email ? bootstrapAdmins.includes(email) : false;

  const existing = await prisma.user.findUnique({
    where: { firebaseUid: decoded.uid },
  });

  const user = await prisma.user.upsert({
    where: { firebaseUid: decoded.uid },
    create: {
      firebaseUid: decoded.uid,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
      avatarUrl: decoded.picture ?? null,
      phone: decoded.phone_number ?? null,
      role: isBootstrapAdmin ? "ADMIN" : "CLIENT",
    },
    update: {
      email: decoded.email ?? existing?.email ?? null,
      name: decoded.name ?? existing?.name ?? null,
      avatarUrl: decoded.picture ?? existing?.avatarUrl ?? null,
      ...(isBootstrapAdmin && existing?.role !== "ADMIN"
        ? { role: "ADMIN" as Role }
        : {}),
    },
  });

  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: FIREBASE_SESSION_MS,
  });

  await setSessionCookie(sessionCookie);
  return user;
}

/** Create session after phone OTP verification (no Firebase required). */
export async function createPhoneSession(user: User): Promise<User> {
  const token = signPhoneSession(user.id);
  await setSessionCookie(token);
  return user;
}

/** Create a first-party signed session for non-Firebase OAuth providers. */
export async function createAppSession(user: User): Promise<User> {
  const token = signPhoneSession(user.id);
  await setSessionCookie(token);
  return user;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Returns the current DB user (with role) or null. Safe to call in RSC. */
export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  // Phone OTP session (prefix p.)
  if (isPhoneSessionToken(cookie)) {
    const userId = verifyPhoneSession(cookie);
    if (!userId) return null;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== "CLIENT" && user?.employeeStatus === "DISMISSED") return null;
    return user;
  }

  // Firebase session
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });
    if (user?.role !== "CLIENT" && user?.employeeStatus === "DISMISSED") return null;
    return user;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireRole(roles: Role[]): Promise<User> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}

function bootstrapAdminPhones(): string[] {
  return (process.env.BOOTSTRAP_ADMIN_PHONES ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

export function isBootstrapAdminPhone(phone: string): boolean {
  return bootstrapAdminPhones().includes(phone);
}
