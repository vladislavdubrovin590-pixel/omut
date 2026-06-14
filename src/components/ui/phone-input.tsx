"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function extractPhoneDigits(value: string): string {
  const digits = value.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
  if (!digits) return "";
  if (digits.startsWith("7")) return digits;
  return `7${digits}`.slice(0, 11);
}

export function formatPhoneFromDigits(digits: string): string {
  if (!digits) return "";
  if (digits === "7") return "+7";

  const local = digits.startsWith("7") ? digits.slice(1) : digits;
  const p1 = local.slice(0, 3);
  const p2 = local.slice(3, 6);
  const p3 = local.slice(6, 8);
  const p4 = local.slice(8, 10);

  let result = "+7";
  if (p1) {
    result += ` (${p1}`;
    if (p1.length === 3) result += ")";
  }
  if (p2) result += ` ${p2}`;
  if (p3) result += `-${p3}`;
  if (p4) result += `-${p4}`;
  return result;
}

/** Apply mask while allowing free correction via Backspace/Delete. */
export function applyPhoneInputChange(newValue: string, prevValue: string): string {
  const prevDigits = extractPhoneDigits(prevValue);
  let newDigits = extractPhoneDigits(newValue);

  // Deleting ")" / spaces / dashes should remove the preceding digit too.
  if (
    newValue.length < prevValue.length &&
    newDigits.length === prevDigits.length &&
    prevDigits.length > 0
  ) {
    newDigits = prevDigits.slice(0, -1);
  }

  return formatPhoneFromDigits(newDigits);
}

/** @deprecated Use applyPhoneInputChange with previous value for editable masks. */
export function formatPhoneInput(value: string): string {
  return formatPhoneFromDigits(extractPhoneDigits(value));
}

export function PhoneInput({
  value,
  onChange,
  className,
  name,
  placeholder = "+7 (900) 123-45-67",
  required,
  autoComplete = "tel",
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  const prevRef = useRef(value);

  useEffect(() => {
    prevRef.current = value;
  }, [value]);

  return (
    <input
      name={name}
      type="tel"
      inputMode="tel"
      autoComplete={autoComplete}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={(e) => {
        const next = applyPhoneInputChange(e.target.value, prevRef.current);
        prevRef.current = next;
        onChange(next);
      }}
      className={cn(
        "h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none placeholder:text-mute focus:border-aqua/50",
        className,
      )}
    />
  );
}
