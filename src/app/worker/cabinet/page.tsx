import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarClock,
  ClipboardCheck,
  Wallet,
} from "lucide-react";
import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/button";
import { PushToggle } from "@/components/cabinet/push-toggle";
import {
  Card,
  EmptyState,
  PageHeading,
  StatCard,
} from "@/components/dashboard/ui";
import { formatDate, formatRub } from "@/lib/utils";

export const metadata = { title: "Мой кабинет" };

export default async function WorkerCabinetPage() {
  const user = await requirePageUser(["WORKER", "ADMIN"]);

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const [completedAgg, monthAgg, assignedCount, recent] = await Promise.all([
    prisma.visit.aggregate({
      where: { workerId: user.id, status: "COMPLETED" },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.visit.aggregate({
      where: {
        workerId: user.id,
        status: "COMPLETED",
        completedAt: { gte: new Date(start.getFullYear(), start.getMonth(), 1) },
      },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.booking.count({
      where: {
        workerId: user.id,
        status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
        scheduledAt: { gte: start },
      },
    }),
    prisma.visit.findMany({
      where: { workerId: user.id, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 8,
      include: { items: true, car: true, user: true },
    }),
  ]);

  const earned = completedAgg._sum.totalAmount ?? 0;
  const average = completedAgg._count
    ? Math.round(earned / completedAgg._count)
    : 0;

  return (
    <>
      <PageHeading
        title={`Кабинет сотрудника${user.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        subtitle="Ваши работы, заработок и предстоящие записи"
        action={
          <ButtonLink href="/worker" size="sm">
            <ClipboardCheck className="h-4 w-4" /> К приёмке
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Выполнено работ"
          value={completedAgg._count}
          hint={`За месяц: ${monthAgg._count}`}
          icon={<BriefcaseBusiness className="h-5 w-5" />}
        />
        <StatCard
          label="Заработано всего"
          value={formatRub(earned)}
          hint={`За месяц: ${formatRub(monthAgg._sum.totalAmount ?? 0)}`}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Средний чек"
          value={formatRub(average)}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Предстоящих записей"
          value={assignedCount}
          icon={<CalendarClock className="h-5 w-5" />}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Последние выполненные работы</h2>
            <Link href="/worker/schedule" className="text-sm text-aqua hover:underline">
              Предстоящие записи
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState
              title="Выполненных работ пока нет"
              hint="Оформите визит на приёмке — он появится здесь"
              icon={<BriefcaseBusiness className="h-8 w-8" />}
            />
          ) : (
            <div className="space-y-3">
              {recent.map((v) => (
                <Card key={v.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-medium text-foam">
                        {v.completedAt ? formatDate(v.completedAt, true) : formatDate(v.arrivedAt, true)}
                      </span>
                      <p className="mt-0.5 text-sm text-mist">
                        {v.user.name ?? v.user.phone ?? "Клиент"}
                        {v.car ? ` · ${v.car.make} ${v.car.model}` : ""}
                      </p>
                    </div>
                    <div className="font-semibold text-teal">{formatRub(v.totalAmount)}</div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-line/60 pt-3">
                    {v.items.map((i) => (
                      <span
                        key={i.id}
                        className="rounded-full border border-line px-2 py-1 text-xs text-mist"
                      >
                        {i.title}
                        {i.qty > 1 ? ` × ${i.qty}` : ""}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 text-lg font-semibold">Личные данные</h2>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-xs text-mute">ФИО</div>
                <div className="font-medium text-foam">{user.name ?? "Не указано"}</div>
              </div>
              <div>
                <div className="text-xs text-mute">Телефон для входа</div>
                <div className="font-medium text-foam">{user.phone ?? "Не указан"}</div>
              </div>
              <div>
                <div className="text-xs text-mute">Роль</div>
                <div className="font-medium text-foam">
                  {user.role === "ADMIN" ? "Администратор" : "Сотрудник"}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold">Уведомления</h2>
            <PushToggle />
          </Card>
        </div>
      </div>
    </>
  );
}
