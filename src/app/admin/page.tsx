import { Wallet, CalendarCheck, Users, Clock } from "lucide-react";
import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Card, PageHeading, StatCard } from "@/components/dashboard/ui";
import {
  RevenueChart,
  TopServicesChart,
  StatusPie,
  CHART_LEGEND_COLORS,
} from "@/components/admin/analytics-charts";
import { formatRub, BOOKING_STATUS_LABELS } from "@/lib/utils";

export const metadata = { title: "Аналитика" };

const MONTHS = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

export default async function AdminHome() {
  await requirePageUser(["ADMIN"]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalAgg,
    monthAgg,
    clientCount,
    pendingCount,
    visits6m,
    statusGroups,
    topItems,
  ] = await Promise.all([
    prisma.visit.aggregate({
      where: { status: "COMPLETED" },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.visit.aggregate({
      where: { status: "COMPLETED", completedAt: { gte: monthStart } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.visit.findMany({
      where: { status: "COMPLETED", completedAt: { gte: sixMonthsAgo } },
      select: { completedAt: true, totalAmount: true },
    }),
    prisma.booking.groupBy({ by: ["status"], _count: true }),
    prisma.visitItem.groupBy({
      by: ["title"],
      _count: { title: true },
      orderBy: { _count: { title: "desc" } },
      take: 6,
    }),
  ]);

  // revenue per month (last 6)
  const revMap = new Map<string, number>();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    revMap.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
  }
  for (const v of visits6m) {
    if (!v.completedAt) continue;
    const key = `${v.completedAt.getFullYear()}-${v.completedAt.getMonth()}`;
    if (revMap.has(key)) revMap.set(key, (revMap.get(key) ?? 0) + v.totalAmount);
  }
  const revenueData = [...revMap.entries()].map(([key, revenue]) => {
    const m = Number(key.split("-")[1]);
    return { month: MONTHS[m], revenue };
  });

  const statusData = statusGroups.map((g) => ({
    name: BOOKING_STATUS_LABELS[g.status] ?? g.status,
    value: g._count,
  }));

  const topData = topItems.map((t) => ({ name: t.title, count: t._count.title }));

  return (
    <>
      <PageHeading title="Аналитика" subtitle="Ключевые показатели студии" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Выручка за месяц"
          value={formatRub(monthAgg._sum.totalAmount ?? 0)}
          hint={`${monthAgg._count} визитов`}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Выручка всего"
          value={formatRub(totalAgg._sum.totalAmount ?? 0)}
          hint={`${totalAgg._count} визитов`}
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Клиентов"
          value={clientCount}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Ждут подтверждения"
          value={pendingCount}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Выручка, 6 месяцев</h2>
          <RevenueChart data={revenueData} />
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Записи по статусам</h2>
          {statusData.length === 0 ? (
            <p className="py-10 text-center text-sm text-mute">Нет данных</p>
          ) : (
            <>
              <StatusPie data={statusData} />
              <div className="mt-3 space-y-1.5">
                {statusData.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-mist">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: CHART_LEGEND_COLORS[i % CHART_LEGEND_COLORS.length] }}
                      />
                      {s.name}
                    </span>
                    <span className="text-foam">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Популярные услуги</h2>
          {topData.length === 0 ? (
            <p className="py-10 text-center text-sm text-mute">
              Данные появятся после выполненных визитов
            </p>
          ) : (
            <TopServicesChart data={topData} />
          )}
        </Card>
      </div>
    </>
  );
}
