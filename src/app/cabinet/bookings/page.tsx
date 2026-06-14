import { CalendarClock } from "lucide-react";
import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/button";
import {
  Card,
  EmptyState,
  PageHeading,
  StatusBadge,
} from "@/components/dashboard/ui";
import { CancelButton } from "@/components/cabinet/cancel-button";
import { formatDate, formatRub, BOOKING_STATUS_LABELS } from "@/lib/utils";

export const metadata = { title: "Мои записи" };

export default async function BookingsPage() {
  const user = await requirePageUser();
  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { services: { include: { service: true } }, car: true },
    orderBy: { scheduledAt: "desc" },
  });

  const cancellable = ["PENDING", "CONFIRMED"];

  return (
    <>
      <PageHeading
        title="Мои записи"
        subtitle="Все заявки и их статусы"
        action={
          <ButtonLink href="/cabinet/book" size="sm">
            Новая запись
          </ButtonLink>
        }
      />

      {bookings.length === 0 ? (
        <EmptyState
          title="Записей пока нет"
          hint="Создайте первую запись на удобное время"
          icon={<CalendarClock className="h-8 w-8" />}
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-medium text-foam">
                    {formatDate(b.scheduledAt, true)}
                  </span>
                  <StatusBadge status={b.status} label={BOOKING_STATUS_LABELS[b.status]} />
                </div>
                <p className="mt-1.5 text-sm text-mist">
                  {b.services.map((s) => s.service.title).join(", ") || "Услуги уточняются"}
                </p>
                {b.car && (
                  <p className="mt-0.5 text-xs text-mute">
                    {b.car.make} {b.car.model}
                    {b.car.plate ? ` · ${b.car.plate}` : ""}
                  </p>
                )}
                {b.note && <p className="mt-1 text-xs text-mute">«{b.note}»</p>}
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <div className="sm:text-right">
                  <div className="text-xs text-mute">оценка</div>
                  <div className="font-semibold text-aqua">{formatRub(b.estimatedTotal)}</div>
                </div>
                {cancellable.includes(b.status) && <CancelButton bookingId={b.id} />}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
