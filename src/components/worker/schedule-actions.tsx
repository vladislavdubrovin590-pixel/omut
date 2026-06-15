"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, UserPlus, UserMinus, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertModal } from "@/components/ui/alert-modal";
import { claimBooking, releaseBooking, confirmArrival } from "@/lib/actions/worker";

export function ClaimButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  return (
    <>
      <AlertModal title="Не удалось взять запись" message={error} onClose={() => setError("")} />
      <Button
        size="sm"
        className="w-full sm:w-auto"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await claimBooking(bookingId);
            if (!res.ok) setError(res.error ?? "Ошибка");
            else router.refresh();
          })
        }
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        Взять запись
      </Button>
    </>
  );
}

export function ReleaseButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  return (
    <>
      <AlertModal title="Не удалось отказаться" message={error} onClose={() => setError("")} />
      <Button
        size="sm"
        variant="outline"
        className="w-full sm:w-auto"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await releaseBooking(bookingId);
            if (!res.ok) setError(res.error ?? "Ошибка");
            else router.refresh();
          })
        }
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
        Отказаться
      </Button>
    </>
  );
}

export function ArrivalButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  return (
    <>
      <AlertModal title="Не удалось отметить приезд" message={error} onClose={() => setError("")} />
      <Button
        size="sm"
        variant="subtle"
        className="w-full sm:w-auto"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await confirmArrival(bookingId);
            if (res && !res.ok) setError(res.error ?? "Ошибка");
            else router.refresh();
          })
        }
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        Приехал
      </Button>
    </>
  );
}

export function ProcessLink({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant="outline"
      className="w-full sm:w-auto"
      onClick={() => router.push(`/worker?tab=new&booking=${bookingId}`)}
    >
      <Car className="h-4 w-4" />
      Оформить
    </Button>
  );
}
