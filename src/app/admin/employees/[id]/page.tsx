import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarClock,
  Phone,
  StickyNote,
} from "lucide-react";
import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { EmployeeForm } from "@/components/admin/employee-form";
import { Card, EmptyState, PageHeading, StatCard, StatusBadge } from "@/components/dashboard/ui";
import { BOOKING_STATUS_LABELS, formatDate, formatRub } from "@/lib/utils";

export const metadata = { title: "Карточка сотрудника" };

const VISIT_STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: "В работе",
  COMPLETED: "Завершена",
};

export default async function EmployeeCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageUser(["ADMIN"]);
  const { id } = await params;

  const employee = await prisma.user.findFirst({
    where: { id, role: { in: ["ADMIN", "WORKER"] } },
    include: {
      assignedBookings: {
        orderBy: { scheduledAt: "desc" },
        take: 20,
        include: {
          user: true,
          car: true,
          services: { include: { service: true } },
        },
      },
      workedVisits: {
        orderBy: { arrivedAt: "desc" },
        include: {
          user: true,
          car: true,
          items: { include: { service: true } },
        },
      },
    },
  });

  if (!employee) notFound();

  const completedVisits = employee.workedVisits.filter((visit) => visit.status === "COMPLETED");
  const earned = completedVisits.reduce((sum, visit) => sum + visit.totalAmount, 0);
  const average = completedVisits.length ? Math.round(earned / completedVisits.length) : 0;

  return (
    <>
      <Link
        href="/admin/employees"
        className="mb-5 inline-flex items-center gap-2 text-sm text-mist hover:text-aqua"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к сотрудникам
      </Link>

      <PageHeading
        title={employee.name ?? "Карточка сотрудника"}
        subtitle={`${employee.phone ?? "Телефон не указан"} · ${
          employee.role === "ADMIN" ? "Администратор" : "Сотрудник"
        }`}
        action={
          <StatusBadge
            status={employee.employeeStatus}
            label={employee.employeeStatus === "DISMISSED" ? "Уволен" : "Не уволен"}
          />
        }
      />

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <StatCard
          label="Выполнено работ"
          value={completedVisits.length}
          hint={`Всего работ в истории: ${employee.workedVisits.length}`}
          icon={<BriefcaseBusiness className="h-5 w-5" />}
        />
        <StatCard
          label="Заработал"
          value={formatRub(earned)}
          hint="Сумма завершённых работ"
          icon={<StickyNote className="h-5 w-5" />}
        />
        <StatCard
          label="Средний чек"
          value={formatRub(average)}
          hint={`Назначенных записей: ${employee.assignedBookings.length}`}
          icon={<CalendarClock className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <div className="space-y-5">
          <Card>
            <div className="mb-4 flex items-center gap-2 text-foam">
              <Phone className="h-5 w-5 text-aqua" />
              <h2 className="text-lg font-semibold">Личные данные</h2>
            </div>
            <div className="mb-4 rounded-xl border border-line bg-abyss/50 p-3 text-sm">
              <div className="text-mute">Телефон для входа</div>
              <div className="mt-1 font-medium text-foam">{employee.phone ?? "Не указан"}</div>
              {employee.email && <div className="mt-2 text-mute">{employee.email}</div>}
            </div>
            <EmployeeForm employee={employee} />
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <div className="mb-4 flex items-center gap-2 text-foam">
              <BriefcaseBusiness className="h-5 w-5 text-aqua" />
              <h2 className="text-lg font-semibold">Работы сотрудника</h2>
            </div>
            {employee.workedVisits.length === 0 ? (
              <EmptyState
                title="Работ пока нет"
                hint="Когда сотрудник оформит визит, он появится в этой карточке"
                icon={<BriefcaseBusiness className="h-8 w-8" />}
              />
            ) : (
              <div className="space-y-3">
                {employee.workedVisits.map((visit) => (
                  <Link key={visit.id} href={`/admin/visits/${visit.id}`}>
                    <div className="rounded-xl border border-line bg-white/[0.02] p-4 transition-colors hover:border-aqua/40">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="font-medium text-foam">
                            {visit.car
                              ? `${visit.car.make} ${visit.car.model}`
                              : "Автомобиль не указан"}
                          </div>
                          <div className="mt-1 text-sm text-mute">
                            {formatDate(visit.completedAt ?? visit.arrivedAt, true)} ·{" "}
                            {visit.user.name ?? visit.user.phone ?? "Клиент"}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {visit.items.slice(0, 4).map((item) => (
                              <span
                                key={item.id}
                                className="rounded-full border border-line px-2 py-1 text-xs text-mist"
                              >
                                {item.service?.title ?? item.title}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="md:text-right">
                          <StatusBadge
                            status={visit.status}
                            label={VISIT_STATUS_LABELS[visit.status]}
                          />
                          <div className="mt-2 font-semibold text-aqua">
                            {formatRub(visit.totalAmount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2 text-foam">
              <CalendarClock className="h-5 w-5 text-aqua" />
              <h2 className="text-lg font-semibold">Назначенные записи</h2>
            </div>
            {employee.assignedBookings.length === 0 ? (
              <EmptyState
                title="Записей пока нет"
                hint="Запись появится здесь, когда администратора назначит сотрудника"
                icon={<CalendarClock className="h-8 w-8" />}
              />
            ) : (
              <div className="space-y-3">
                {employee.assignedBookings.map((booking) => (
                  <div key={booking.id} className="rounded-xl border border-line bg-white/[0.02] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="font-medium text-foam">
                          {booking.user.name ?? booking.user.phone ?? "Клиент"}
                        </div>
                        <div className="mt-1 text-sm text-mute">
                          {formatDate(booking.scheduledAt, true)}
                          {booking.car ? ` · ${booking.car.make} ${booking.car.model}` : ""}
                        </div>
                        <div className="mt-2 text-sm text-mist">
                          {booking.services.map((item) => item.service.title).join(", ") || "Услуги"}
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <StatusBadge
                          status={booking.status}
                          label={BOOKING_STATUS_LABELS[booking.status]}
                        />
                        <div className="mt-2 font-semibold text-aqua">
                          {formatRub(booking.estimatedTotal)}
                        </div>
                      </div>
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
