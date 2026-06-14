import { CalendarDays } from "lucide-react";
import { Prisma } from "@prisma/client";
import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeading } from "@/components/dashboard/ui";
import { BookingStatusSelect } from "@/components/admin/booking-status-select";
import { formatDate, formatRub } from "@/lib/utils";

export const metadata = { title: "Записи" };

const bookingInclude = {
  services: { include: { service: true } },
  car: true,
  user: true,
} satisfies Prisma.BookingInclude;

type BookingRow = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;

function groupByDay(items: BookingRow[]): [string, BookingRow[]][] {
  const map = new Map<string, BookingRow[]>();
  for (const it of items) {
    const key = it.scheduledAt.toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(it);
  }
  return [...map.entries()];
}

export default async function AdminBookings() {
  await requirePageUser(["ADMIN"]);

  const bookings = await prisma.booking.findMany({
    include: bookingInclude,
    orderBy: { scheduledAt: "desc" },
    take: 200,
  });

  const dayAgo = new Date();
  dayAgo.setDate(dayAgo.getDate() - 1);
  const upcoming = bookings
    .filter((b) => b.scheduledAt >= dayAgo)
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  const past = bookings.filter((b) => b.scheduledAt < dayAgo);

  return (
    <>
      <PageHeading title="Записи" subtitle="Управление заявками и расписанием" />

      {bookings.length === 0 ? (
        <EmptyState title="Записей пока нет" icon={<CalendarDays className="h-8 w-8" />} />
      ) : (
        <div className="space-y-8">
          <Section title="Предстоящие" groups={groupByDay(upcoming)} />
          {past.length > 0 && <Section title="Прошедшие" groups={groupByDay(past)} muted />}
        </div>
      )}
    </>
  );
}

function Section({
  title,
  groups,
  muted,
}: {
  title: string;
  groups: [string, BookingRow[]][];
  muted?: boolean;
}) {
  if (groups.length === 0) {
    return (
      <div>
        <h2 className="mb-3 text-lg font-semibold">{title}</h2>
        <p className="text-sm text-mute">Нет записей</p>
      </div>
    );
  }
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="space-y-5">
        {groups.map(([day, rows]) => (
          <div key={day}>
            <p className="mb-2 text-xs uppercase tracking-wide text-mute">
              {formatDate(new Date(day))}
            </p>
            <div className="space-y-2">
              {rows.map((b) => (
                <Card
                  key={b.id}
                  className={`flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center ${muted ? "opacity-80" : ""}`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-medium text-foam">
                        {new Intl.DateTimeFormat("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(b.scheduledAt)}
                      </span>
                      <span className="text-sm text-foam">
                        {b.user.name ?? b.user.phone ?? b.user.email ?? "Клиент"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-mist">
                      {b.services.map((s) => s.service.title).join(", ") || "—"}
                    </p>
                    {b.car && (
                      <p className="mt-0.5 text-xs text-mute">
                        {b.car.make} {b.car.model}
                        {b.car.plate ? ` · ${b.car.plate}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <span className="font-semibold text-aqua">{formatRub(b.estimatedTotal)}</span>
                    <BookingStatusSelect bookingId={b.id} status={b.status} />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
