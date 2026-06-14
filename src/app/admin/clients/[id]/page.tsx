import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, History, StickyNote } from "lucide-react";
import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { ClientCardForm } from "@/components/admin/client-card-form";
import { Card, EmptyState, PageHeading, StatusBadge } from "@/components/dashboard/ui";
import { formatDate, formatRub } from "@/lib/utils";

export const metadata = { title: "Карточка клиента" };

const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Новая",
  CONFIRMED: "Подтверждена",
  IN_PROGRESS: "В работе",
  COMPLETED: "Завершена",
  CANCELLED: "Отменена",
  NO_SHOW: "Не приехал",
};

const VISIT_STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: "В работе",
  COMPLETED: "Завершен",
  CANCELLED: "Отменен",
};

export default async function AdminClientCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageUser(["ADMIN"]);
  const { id } = await params;

  const client = await prisma.user.findUnique({
    where: { id },
    include: {
      cars: { orderBy: { createdAt: "desc" } },
      bookings: {
        orderBy: { scheduledAt: "desc" },
        include: { services: { include: { service: true } }, car: true },
      },
      visits: {
        orderBy: { arrivedAt: "desc" },
        include: {
          car: true,
          worker: true,
          items: { include: { service: true } },
        },
      },
    },
  });

  if (!client) notFound();

  const completedVisits = client.visits.filter((visit) => visit.status === "COMPLETED");
  const spent = completedVisits.reduce((sum, visit) => sum + visit.totalAmount, 0);

  return (
    <>
      <Link
        href="/admin/clients"
        className="mb-5 inline-flex items-center gap-2 text-sm text-mist hover:text-aqua"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к клиентам
      </Link>

      <PageHeading
        title={client.name ?? "Карточка клиента"}
        subtitle={`${client.phone ?? "Телефон не указан"} · визитов: ${completedVisits.length} · сумма: ${formatRub(spent)}`}
      />

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <Card>
            <div className="mb-4 flex items-center gap-2 text-foam">
              <StickyNote className="h-5 w-5 text-aqua" />
              <h2 className="text-lg font-semibold">Данные и отметки</h2>
            </div>
            <ClientCardForm client={client} />
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-foam">Автомобили</h2>
            {client.cars.length === 0 ? (
              <p className="text-sm text-mute">Автомобили не добавлены</p>
            ) : (
              <div className="space-y-3">
                {client.cars.map((car) => (
                  <div key={car.id} className="rounded-xl border border-line bg-white/[0.02] p-3">
                    <div className="font-medium text-foam">
                      {car.make} {car.model}
                    </div>
                    <div className="text-sm text-mute">
                      {[car.year, car.plate].filter(Boolean).join(" · ") || "Данные уточняются"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <div className="mb-4 flex items-center gap-2 text-foam">
              <History className="h-5 w-5 text-aqua" />
              <h2 className="text-lg font-semibold">История выполненных работ</h2>
            </div>
            {client.visits.length === 0 ? (
              <EmptyState title="Истории визитов пока нет" icon={<History className="h-8 w-8" />} />
            ) : (
              <div className="space-y-3">
                {client.visits.map((visit) => (
                  <div key={visit.id} className="rounded-xl border border-line bg-white/[0.02] p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="font-medium text-foam">
                          {visit.car
                            ? `${visit.car.make} ${visit.car.model}`
                            : "Автомобиль не указан"}
                        </div>
                        <div className="text-sm text-mute">
                          {formatDate(visit.completedAt ?? visit.arrivedAt)}
                          {visit.worker?.name ? ` · ${visit.worker.name}` : ""}
                        </div>
                      </div>
                      <div className="md:text-right">
                        <StatusBadge status={visit.status} label={VISIT_STATUS_LABELS[visit.status]} />
                        <div className="mt-1 text-sm font-semibold text-teal">
                          {formatRub(visit.totalAmount)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {visit.items.map((item) => (
                        <span
                          key={item.id}
                          className="rounded-full border border-line px-2 py-1 text-xs text-mist"
                        >
                          {item.service?.title ?? item.title} · {formatRub(item.price)}
                        </span>
                      ))}
                    </div>
                    {visit.note && <p className="mt-3 text-sm text-mist">{visit.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2 text-foam">
              <CalendarClock className="h-5 w-5 text-aqua" />
              <h2 className="text-lg font-semibold">Записи</h2>
            </div>
            {client.bookings.length === 0 ? (
              <EmptyState title="Записей пока нет" icon={<CalendarClock className="h-8 w-8" />} />
            ) : (
              <div className="space-y-3">
                {client.bookings.map((booking) => (
                  <div key={booking.id} className="rounded-xl border border-line bg-white/[0.02] p-4">
                    <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <div className="font-medium text-foam">
                          {booking.services.map((item) => item.service.title).join(", ") || "Услуги"}
                        </div>
                        <div className="text-sm text-mute">
                          {formatDate(booking.scheduledAt)}
                          {booking.car
                            ? ` · ${booking.car.make} ${booking.car.model}`
                            : ""}
                        </div>
                        {booking.note && (
                          <p className="mt-2 text-sm text-mist">{booking.note}</p>
                        )}
                      </div>
                      <StatusBadge
                        status={booking.status}
                        label={BOOKING_STATUS_LABELS[booking.status]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
