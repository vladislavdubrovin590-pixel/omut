import Link from "next/link";
import { BadgePercent, CalendarClock, CalendarPlus, Clock, Wallet, Car } from "lucide-react";
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
import {
  bookingDisplayTotal,
  formatDate,
  formatRub,
  BOOKING_STATUS_LABELS,
} from "@/lib/utils";

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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
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
        <StatCard
          label="Ваша скидка"
          value={`${user.bonusDiscountPercent}%`}
          hint={user.bonusDiscountPercent > 0 ? "Применяется при записи" : "Пока без персональной скидки"}
          icon={<BadgePercent className="h-5 w-5" />}
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
            {upcoming.map((b) => {
              const total = bookingDisplayTotal(
                b.status,
                b.estimatedTotal,
                b.services,
                user.bonusDiscountPercent,
              );
              return (
                <Card key={b.id} className="overflow-hidden p-0">
                  <div className="border-b border-line bg-aqua/5 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-aqua/10 text-aqua">
                          <CalendarClock className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="font-semibold text-foam">
                            {formatDate(b.scheduledAt)}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-sm text-mist">
                            <Clock className="h-3.5 w-3.5" />
                            {new Intl.DateTimeFormat("ru-RU", {
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(b.scheduledAt)}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={b.status} label={BOOKING_STATUS_LABELS[b.status]} />
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-mute">Услуги</div>
                      <p className="mt-1 text-sm text-foam">
                        {b.services.map((s) => s.service.title).join(", ") || "Услуги уточняются"}
                      </p>
                    </div>
                    {b.car && (
                      <div className="rounded-xl border border-line bg-abyss/40 p-3">
                        <div className="text-xs uppercase tracking-wide text-mute">Автомобиль</div>
                        <div className="mt-1 text-sm text-mist">
                          {b.car.make} {b.car.model}
                          {b.car.plate ? ` · ${b.car.plate}` : ""}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between rounded-xl border border-aqua/20 bg-aqua/10 px-3 py-2">
                      <span className="text-sm text-mist">Предварительная стоимость</span>
                      <span className="font-semibold text-aqua">{formatRub(total)}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
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
