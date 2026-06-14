import Link from "next/link";
import { CalendarClock, CalendarPlus, Wallet, Car } from "lucide-react";
import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/button";
import {
  Card,
  EmptyState,
  PageHeading,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/ui";
import { formatDate, formatRub, BOOKING_STATUS_LABELS } from "@/lib/utils";

export default async function CabinetHome() {
  const user = await requirePageUser();

  const [upcoming, visits, visitAgg, carsCount] = await Promise.all([
    prisma.booking.findMany({
      where: {
        userId: user.id,
        status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
      },
      include: { services: { include: { service: true } }, car: true },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.visit.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 3,
      include: { items: true },
    }),
    prisma.visit.aggregate({
      where: { userId: user.id, status: "COMPLETED" },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.car.count({ where: { userId: user.id } }),
  ]);

  return (
    <>
      <PageHeading
        title={`Здравствуйте${user.name ? `, ${user.name.split(" ")[0]}` : ""}!`}
        subtitle="Ваши записи, история обслуживания и быстрые действия"
        action={
          <ButtonLink href="/cabinet/book" size="sm">
            <CalendarPlus className="h-4 w-4" /> Записаться
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Активных записей"
          value={upcoming.length}
          icon={<CalendarClock className="h-5 w-5" />}
        />
        <StatCard
          label="Визитов"
          value={visitAgg._count}
          icon={<CalendarPlus className="h-5 w-5" />}
        />
        <StatCard
          label="Потрачено"
          value={formatRub(visitAgg._sum.totalAmount ?? 0)}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Автомобилей"
          value={carsCount}
          icon={<Car className="h-5 w-5" />}
        />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ближайшие записи</h2>
          <Link href="/cabinet/bookings" className="text-sm text-aqua hover:underline">
            Все записи
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState
            title="Пока нет активных записей"
            hint="Запишитесь на удобное время — это займёт минуту"
            icon={<CalendarClock className="h-8 w-8" />}
          />
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <Card key={b.id} className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-foam">
                      {formatDate(b.scheduledAt, true)}
                    </span>
                    <StatusBadge status={b.status} label={BOOKING_STATUS_LABELS[b.status]} />
                  </div>
                  <p className="mt-1 text-sm text-mist">
                    {b.services.map((s) => s.service.title).join(", ") || "Услуги уточняются"}
                  </p>
                  {b.car && (
                    <p className="mt-0.5 text-xs text-mute">
                      {b.car.make} {b.car.model}
                      {b.car.plate ? ` · ${b.car.plate}` : ""}
                    </p>
                  )}
                </div>
                <div className="sm:text-right">
                  <div className="text-xs text-mute">оценка</div>
                  <div className="font-semibold text-aqua">{formatRub(b.estimatedTotal)}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Последние визиты</h2>
          <Link href="/cabinet/history" className="text-sm text-aqua hover:underline">
            Вся история
          </Link>
        </div>
        {visits.length === 0 ? (
          <EmptyState title="История обслуживания появится после первого визита" />
        ) : (
          <div className="space-y-3">
            {visits.map((v) => (
              <Card key={v.id} className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <span className="font-medium text-foam">
                    {v.completedAt ? formatDate(v.completedAt) : formatDate(v.arrivedAt)}
                  </span>
                  <p className="mt-1 text-sm text-mist">
                    {v.items.map((i) => i.title).join(", ")}
                  </p>
                </div>
                <div className="font-semibold text-teal">{formatRub(v.totalAmount)}</div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
