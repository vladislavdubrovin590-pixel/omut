import "server-only";
import { createHash, randomInt } from "crypto";

/** Normalize to E.164 for Russia: +79XXXXXXXXX */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length === 11 && digits.startsWith("7")) {
    return `+${digits}`;
  }
  if (digits.length === 10 && digits.startsWith("9")) {
    return `+7${digits}`;
  }
  return null;
}

export function formatPhoneDisplay(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length === 11) {
    return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
  }
  return phone;
}

export function generateOtpCode(): string {
  return String(randomInt(100000, 999999));
}

export function hashOtpCode(phone: string, code: string): string {
  const secret = process.env.SESSION_SECRET ?? "dev-insecure-secret";
  return createHash("sha256").update(`${phone}:${code}:${secret}`).digest("hex");
}

export function verifyOtpCode(phone: string, code: string, hash: string): boolean {
  return hashOtpCode(phone, code) === hash;
}
