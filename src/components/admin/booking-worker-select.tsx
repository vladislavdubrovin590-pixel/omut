"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { assignBookingWorker } from "@/lib/actions/admin";

type WorkerOpt = {
  id: string;
  name: string | null;
  phone: string | null;
};

export function BookingWorkerSelect({
  bookingId,
  workerId,
  workers,
}: {
  bookingId: string;
  workerId: string | null;
  workers: WorkerOpt[];
}) {
  const [value, setValue] = useState(workerId ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      {pending && <Loader2 className="h-4 w-4 animate-spin text-mute" />}
      <select
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          startTransition(async () => {
            await assignBookingWorker(bookingId, next);
          });
        }}
        className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-xs text-foam outline-none focus:border-aqua/50 sm:w-44"
      >
        <option value="" className="bg-surface">Назначить</option>
        {workers.map((worker) => (
          <option key={worker.id} value={worker.id} className="bg-surface">
            {worker.name ?? worker.phone ?? "Сотрудник"}
          </option>
        ))}
      </select>
    </div>
  );
}
