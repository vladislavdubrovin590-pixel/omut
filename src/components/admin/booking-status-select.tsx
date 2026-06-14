"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateBookingStatus } from "@/lib/actions/admin";
import { BOOKING_STATUS_LABELS } from "@/lib/utils";
import type { BookingStatus } from "@prisma/client";

const STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

export function BookingStatusSelect({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, start] = useTransition();

  function change(next: string) {
    setValue(next);
    start(async () => {
      await updateBookingStatus(bookingId, next as BookingStatus);
      router.refresh();
    });
  }

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      {pending && <Loader2 className="h-4 w-4 animate-spin text-mute" />}
      <select
        value={value}
        onChange={(e) => change(e.target.value)}
        className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-xs text-foam outline-none focus:border-aqua/50 sm:h-9 sm:w-auto"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s} className="bg-surface">
            {BOOKING_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
