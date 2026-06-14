import { UserCog } from "lucide-react";
import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { EmployeeForm } from "@/components/admin/employee-form";
import { Card, EmptyState, PageHeading } from "@/components/dashboard/ui";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Сотрудники" };

export default async function AdminEmployeesPage() {
  await requirePageUser(["ADMIN"]);

  const employees = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "WORKER"] } },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { visits: true } },
    },
  });

  return (
    <>
      <PageHeading
        title="Управление сотрудниками"
        subtitle="Создание аккаунтов, права доступа и внутренние данные команды"
      />

      <div className="grid gap-5">
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-foam">Новый сотрудник</h2>
          <EmployeeForm />
        </Card>

        {employees.length === 0 ? (
          <EmptyState title="Сотрудников пока нет" icon={<UserCog className="h-8 w-8" />} />
        ) : (
          employees.map((employee) => (
            <Card key={employee.id}>
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foam">
                    {employee.name ?? "Без имени"}
                  </h2>
                  <p className="text-sm text-mute">
                    {employee.role === "ADMIN" ? "Администратор" : "Сотрудник"} · с{" "}
                    {formatDate(employee.createdAt)} · визитов: {employee._count.visits}
                  </p>
                </div>
              </div>
              <EmployeeForm employee={employee} />
            </Card>
          ))
        )}
      </div>
    </>
  );
}
