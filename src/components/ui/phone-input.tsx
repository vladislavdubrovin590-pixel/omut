"use client";

import { cn } from "@/lib/utils";

export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
  const normalized = digits.startsWith("7") ? digits : `7${digits}`;
  const d = normalized.slice(1);
  const parts = [
    d.slice(0, 3),
    d.slice(3, 6),
    d.slice(6, 8),
    d.slice(8, 10),
  ];

  let result = "+7";
  if (parts[0]) result += ` (${parts[0]}`;
  if (parts[0]?.length === 3) result += ")";
  if (parts[1]) result += ` ${parts[1]}`;
  if (parts[2]) result += `-${parts[2]}`;
  if (parts[3]) result += `-${parts[3]}`;
  return result;
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
  return (
    <input
      name={name}
      type="tel"
      inputMode="tel"
      autoComplete={autoComplete}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(formatPhoneInput(e.target.value))}
      className={cn(
        "h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none placeholder:text-mute focus:border-aqua/50",
        className,
      )}
    />
  );
}
