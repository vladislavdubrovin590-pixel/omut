import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

export const PHONE_SESSION_PREFIX = "p.";

const MAX_AGE_SEC = 60 * 60 * 24 * 5; // 5 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production");
  }
  return secret ?? "dev-insecure-secret-change-me";
}

/** Signed phone session token stored in omut_session cookie. */
export function signPhoneSession(userId: string): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const payload = `${userId}.${exp}`;
  const sig = createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
  return `${PHONE_SESSION_PREFIX}${payload}.${sig}`;
}

export function verifyPhoneSession(token: string): string | null {
  if (!token.startsWith(PHONE_SESSION_PREFIX)) return null;

  const rest = token.slice(PHONE_SESSION_PREFIX.length);
  const lastDot = rest.lastIndexOf(".");
  if (lastDot === -1) return null;

  const payload = rest.slice(0, lastDot);
  const sig = rest.slice(lastDot + 1);
  const expected = createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");

  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  const [userId, expStr] = payload.split(".");
  const exp = Number(expStr);
  if (!userId || !exp || exp < Math.floor(Date.now() / 1000)) return null;

  return userId;
}

export function isPhoneSessionToken(token: string): boolean {
  return token.startsWith(PHONE_SESSION_PREFIX);
}
