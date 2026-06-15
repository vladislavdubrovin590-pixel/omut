import { CalendarClock } from "lucide-react";
import { Prisma } from "@prisma/client";
import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeading, StatusBadge } from "@/components/dashboard/ui";
import {
  ArrivalButton,
  ClaimButton,
  ProcessLink,
  ReleaseButton,
} from "@/components/worker/schedule-actions";
import {
  BOOKING_STATUS_LABELS,
  bookingDisplayTotal,
  formatDate,
  formatRub,
} from "@/lib/utils";

export const metadata = { title: "Записи" };

const bookingInclude = {
  services: { include: { service: true } },
  car: true,
  user: true,
  worker: true,
} satisfies Prisma.BookingInclude;

type Row = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;

function groupByDay(items: Row[]): [string, Row[]][] {
  const map = new Map<string, Row[]>();
  for (const it of items) {
    const key = it.scheduledAt.toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(it);
  }
  return [...map.entries()];
}

export default async function WorkerSchedulePage() {
  const user = await requirePageUser(["WORKER", "ADMIN"]);

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
      scheduledAt: { gte: start },
      ...(user.role === "WORKER"
        ? { OR: [{ workerId: user.id }, { workerId: null }] }
        : {}),
    },
    include: bookingInclude,
    orderBy: { scheduledAt: "asc" },
    take: 200,
  });

  const mine = bookings.filter((b) => b.workerId === user.id);
  const free = bookings.filter((b) => !b.workerId);
  const others =
    user.role === "ADMIN"
      ? bookings.filter((b) => b.workerId && b.workerId !== user.id)
      : [];

  return (
    <>
      <PageHeading
        title="Записи"
        subtitle="Предстоящие записи: ваши назначенные и свободные, которые можно взять"
      />

      <div className="space-y-8">
        <Section
          title="Мои записи"
          emptyHint="Здесь появятся записи, назначенные на вас или взятые вами"
          groups={groupByDay(mine)}
          discountByUser
          variant="mine"
        />
        <Section
          title="Свободные записи"
          emptyHint="Свободных записей сейчас нет"
          groups={groupByDay(free)}
          variant="free"
        />
        {user.role === "ADMIN" && others.length > 0 && (
          <Section title="Записи других сотрудников" groups={groupByDay(others)} variant="other" />
        )}
      </div>
    </>
  );
}

function Section({
  title,
  groups,
  emptyHint,
  variant,
}: {
  title: string;
  groups: [string, Row[]][];
  emptyHint?: string;
  discountByUser?: boolean;
  variant: "mine" | "free" | "other";
}) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {groups.length === 0 ? (
        <EmptyState title={emptyHint ?? "Нет записей"} icon={<CalendarClock className="h-8 w-8" />} />
      ) : (
        <div className="space-y-5">
          {groups.map(([day, rows]) => (
            <div key={day}>
              <p className="mb-2 text-xs uppercase tracking-wide text-mute">
                {formatDate(new Date(day))}
              </p>
              <div className="space-y-2">
                {rows.map((b) => {
                  const total = bookingDisplayTotal(
                    b.status,
                    b.estimatedTotal,
                    b.services,
                    b.user.bonusDiscountPercent,
                  );
                  return (
                    <Card
                      key={b.id}
                      className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center"
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
                            {b.user.name ?? b.user.phone ?? "Клиент"}
                          </span>
                          <StatusBadge status={b.status} label={BOOKING_STATUS_LABELS[b.status]} />
                          {b.user.bonusDiscountPercent > 0 && (
                            <span className="rounded-full bg-aqua/15 px-2 py-0.5 text-xs text-aqua">
                              скидка {b.user.bonusDiscountPercent}%
                            </span>
                          )}
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
                        {variant === "other" && b.worker && (
                          <p className="mt-1 text-xs text-mute">
                            Сотрудник: {b.worker.name ?? b.worker.phone ?? "—"}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 sm:items-end">
                        <span className="font-semibold text-aqua">{formatRub(total)}</span>
                        {variant === "mine" && (
                          <div className="grid grid-cols-2 gap-2 sm:flex">
                            {b.status !== "IN_PROGRESS" && <ArrivalButton bookingId={b.id} />}
                            <ProcessLink bookingId={b.id} />
                            {b.status !== "IN_PROGRESS" && <ReleaseButton bookingId={b.id} />}
                          </div>
                        )}
                        {variant === "free" && <ClaimButton bookingId={b.id} />}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
