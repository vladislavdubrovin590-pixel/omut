import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CarFront, ReceiptText, UserRound } from "lucide-react";
import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Card, PageHeading, StatusBadge } from "@/components/dashboard/ui";
import { BODY_CLASS_LABELS, formatDate, formatRub } from "@/lib/utils";

export const metadata = { title: "Работа" };

const VISIT_STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: "В работе",
  COMPLETED: "Завершена",
};

export default async function AdminVisitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageUser(["ADMIN"]);
  const { id } = await params;

  const visit = await prisma.visit.findUnique({
    where: { id },
    include: {
      user: true,
      worker: true,
      car: true,
      booking: {
        include: {
          services: { include: { service: true } },
        },
      },
      items: { include: { service: true } },
    },
  });

  if (!visit) notFound();

  return (
    <>
      <Link
        href={visit.workerId ? `/admin/employees/${visit.workerId}` : "/admin/employees"}
        className="mb-5 inline-flex items-center gap-2 text-sm text-mist hover:text-aqua"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к сотруднику
      </Link>

      <PageHeading
        title="Карточка работы"
        subtitle={`${formatDate(visit.completedAt ?? visit.arrivedAt, true)} · ${formatRub(
          visit.totalAmount,
        )}`}
        action={<StatusBadge status={visit.status} label={VISIT_STATUS_LABELS[visit.status]} />}
      />

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <Card>
            <div className="mb-4 flex items-center gap-2 text-foam">
              <UserRound className="h-5 w-5 text-aqua" />
              <h2 className="text-lg font-semibold">Участники</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-line bg-abyss/50 p-3">
                <div className="text-mute">Клиент</div>
                <div className="mt-1 font-medium text-foam">
                  {visit.user.name ?? visit.user.phone ?? "Клиент"}
                </div>
                {visit.user.phone && <div className="mt-1 text-mute">{visit.user.phone}</div>}
              </div>
              <div className="rounded-xl border border-line bg-abyss/50 p-3">
                <div className="text-mute">Исполнитель</div>
                <div className="mt-1 font-medium text-foam">
                  {visit.worker?.name ?? visit.worker?.phone ?? "Не назначен"}
                </div>
                {visit.worker?.phone && <div className="mt-1 text-mute">{visit.worker.phone}</div>}
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2 text-foam">
              <CarFront className="h-5 w-5 text-aqua" />
              <h2 className="text-lg font-semibold">Автомобиль</h2>
            </div>
            {visit.car ? (
              <div className="rounded-xl border border-line bg-abyss/50 p-3 text-sm">
                <div className="font-medium text-foam">
                  {visit.car.make} {visit.car.model}
                </div>
                <div className="mt-1 text-mute">
                  {[visit.car.year, visit.car.color, visit.car.plate].filter(Boolean).join(" · ") ||
                    "Данные уточняются"}
                </div>
                <div className="mt-1 text-mute">
                  {BODY_CLASS_LABELS[visit.car.bodyClass] ?? visit.car.bodyClass}
                </div>
              </div>
            ) : (
              <p className="text-sm text-mute">Автомобиль не указан</p>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <div className="mb-4 flex items-center gap-2 text-foam">
              <ReceiptText className="h-5 w-5 text-aqua" />
              <h2 className="text-lg font-semibold">Выполненные позиции</h2>
            </div>
            <div className="space-y-2">
              {visit.items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-2 rounded-xl border border-line bg-white/[0.02] p-3 sm:grid-cols-[1fr_5rem_8rem] sm:items-center"
                >
                  <div>
                    <div className="font-medium text-foam">
                      {item.service?.title ?? item.title}
                    </div>
                    {item.service && (
                      <div className="mt-1 text-xs text-mute">Из единого прайса</div>
                    )}
                  </div>
                  <div className="text-sm text-mist">x{item.qty}</div>
                  <div className="font-semibold text-aqua sm:text-right">
                    {formatRub(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-aqua/20 bg-aqua/10 p-4">
              <span className="text-sm text-mist">Итого</span>
              <span className="text-xl font-semibold text-aqua">{formatRub(visit.totalAmount)}</span>
            </div>
            {visit.note && <p className="mt-4 text-sm text-mist">{visit.note}</p>}
          </Card>
        </div>
      </div>
    </>
  );
}
