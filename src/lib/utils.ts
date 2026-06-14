import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRub(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: Date | string, withTime = false): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(d);
}

const LIVE_BOOKING_STATUSES = new Set(["PENDING", "CONFIRMED", "IN_PROGRESS"]);

export function normalizeDiscountPercent(value: number | null | undefined): number {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

export function applyPercentDiscount(value: number, discountPercent: number | null | undefined): number {
  const discount = normalizeDiscountPercent(discountPercent);
  if (discount === 0) return value;
  return Math.max(0, Math.round(value * (100 - discount) / 100));
}

export function discountAmount(value: number, discountPercent: number | null | undefined): number {
  return Math.max(0, value - applyPercentDiscount(value, discountPercent));
}

export function bookingDisplayTotal(
  status: string,
  estimatedTotal: number,
  services: { price: number; service: { basePrice: number } }[],
  discountPercent = 0,
): number {
  if (!LIVE_BOOKING_STATUSES.has(status)) return estimatedTotal;
  return services.reduce(
    (sum, item) => sum + applyPercentDiscount(item.service.basePrice, discountPercent),
    0,
  );
}

export const BODY_CLASS_LABELS: Record<string, string> = {
  A: "A — малый класс",
  B: "B — седан / хэтчбек",
  C: "C — кроссовер / универсал",
  D: "D — внедорожник / бизнес",
  E: "E — большой внедорожник / минивэн",
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Ожидает подтверждения",
  CONFIRMED: "Подтверждена",
  IN_PROGRESS: "В работе",
  COMPLETED: "Выполнена",
  CANCELLED: "Отменена",
  NO_SHOW: "Не приехал",
};
