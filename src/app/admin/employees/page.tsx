import Link from "next/link";
import { Plus, UserCog } from "lucide-react";
import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeading, StatusBadge } from "@/components/dashboard/ui";
import { formatDate, formatRub } from "@/lib/utils";

export const metadata = { title: "Сотрудники" };

export default async function AdminEmployeesPage() {
  await requirePageUser(["ADMIN"]);

  const employees = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "WORKER"] } },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      employeeStatus: true,
      createdAt: true,
      workedVisits: {
        where: { status: "COMPLETED" },
        select: { totalAmount: true },
      },
      _count: { select: { assignedBookings: true, workedVisits: true } },
    },
  });

  return (
    <>
      <PageHeading
        title="Сотрудники"
        subtitle="Список команды, доступы, статус, работы и суммы по каждому сотруднику"
        action={
          <Link
            href="/admin/employees/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-aqua px-5 py-2.5 text-sm font-semibold text-abyss"
          >
            <Plus className="h-4 w-4" />
            Создать сотрудника
          </Link>
        }
      />

      <div className="grid gap-3">
        {employees.length === 0 ? (
          <EmptyState
            title="Сотрудников пока нет"
            hint="Нажмите «Создать сотрудника», чтобы добавить первый аккаунт"
            icon={<UserCog className="h-8 w-8" />}
          />
        ) : (
          employees.map((employee) => {
            const earned = employee.workedVisits.reduce(
              (sum, visit) => sum + visit.totalAmount,
              0,
            );
            return (
              <Link key={employee.id} href={`/admin/employees/${employee.id}`}>
                <Card className="transition-colors hover:border-aqua/40">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-foam">
                          {employee.name ?? "Без имени"}
                        </h2>
                        <StatusBadge
                          status={employee.employeeStatus}
                          label={employee.employeeStatus === "DISMISSED" ? "Уволен" : "Не уволен"}
                        />
                      </div>
                      <p className="text-sm text-mute">
                        {employee.role === "ADMIN" ? "Администратор" : "Сотрудник"} ·{" "}
                        {employee.phone ?? "телефон не указан"}
                      </p>
                      <p className="mt-1 text-xs text-mute">
                        В команде с {formatDate(employee.createdAt)}
                        {employee.email ? ` · ${employee.email}` : ""}
                      </p>
                    </div>
                    <div className="grid gap-2 text-sm sm:grid-cols-3 lg:min-w-[420px]">
                      <div className="rounded-xl border border-line bg-abyss/50 p-3">
                        <div className="text-xs text-mute">Работ</div>
                        <div className="mt-1 font-semibold text-foam">
                          {employee._count.workedVisits}
                        </div>
                      </div>
                      <div className="rounded-xl border border-line bg-abyss/50 p-3">
                        <div className="text-xs text-mute">Записей назначено</div>
                        <div className="mt-1 font-semibold text-foam">
                          {employee._count.assignedBookings}
                        </div>
                      </div>
                      <div className="rounded-xl border border-line bg-abyss/50 p-3">
                        <div className="text-xs text-mute">Заработал</div>
                        <div className="mt-1 font-semibold text-aqua">{formatRub(earned)}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
