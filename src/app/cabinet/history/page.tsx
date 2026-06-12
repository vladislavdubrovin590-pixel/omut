import { History } from "lucide-react";
import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeading, StatCard } from "@/components/dashboard/ui";
import { formatDate, formatRub } from "@/lib/utils";

export const metadata = { title: "История обслуживания" };

export default async function HistoryPage() {
  const user = await requirePageUser();

  const [visits, agg] = await Promise.all([
    prisma.visit.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      include: { items: true, car: true, worker: true },
      orderBy: { completedAt: "desc" },
    }),
    prisma.visit.aggregate({
      where: { userId: user.id, status: "COMPLETED" },
      _sum: { totalAmount: true },
      _count: true,
    }),
  ]);

  return (
    <>
      <PageHeading title="История обслуживания" subtitle="Выполненные визиты и услуги" />

      <div className="mb-6 grid grid-cols-2 gap-4">
        <StatCard label="Всего визитов" value={agg._count} />
        <StatCard label="Сумма за всё время" value={formatRub(agg._sum.totalAmount ?? 0)} />
      </div>

      {visits.length === 0 ? (
        <EmptyState
          title="История пуста"
          hint="Здесь появятся выполненные услуги после визита"
          icon={<History className="h-8 w-8" />}
        />
      ) : (
        <div className="space-y-3">
          {visits.map((v) => (
            <Card key={v.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-medium text-foam">
                    {v.completedAt ? formatDate(v.completedAt) : formatDate(v.arrivedAt)}
                  </span>
                  {v.car && (
                    <p className="mt-0.5 text-xs text-mute">
                      {v.car.make} {v.car.model}
                      {v.car.plate ? ` · ${v.car.plate}` : ""}
                    </p>
                  )}
                </div>
                <div className="font-semibold text-teal">{formatRub(v.totalAmount)}</div>
              </div>
              <div className="mt-3 divide-y divide-line/60 border-t border-line/60">
                {v.items.map((i) => (
                  <div key={i.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-mist">
                      {i.title}
                      {i.qty > 1 ? ` × ${i.qty}` : ""}
                    </span>
                    <span className="text-foam">{formatRub(i.price * i.qty)}</span>
                  </div>
                ))}
              </div>
              {v.note && <p className="mt-2 text-xs text-mute">Комментарий: {v.note}</p>}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
