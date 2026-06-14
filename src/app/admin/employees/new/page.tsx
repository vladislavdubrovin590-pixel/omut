import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { requirePageUser } from "@/lib/guards";
import { EmployeeForm } from "@/components/admin/employee-form";
import { Card, PageHeading } from "@/components/dashboard/ui";

export const metadata = { title: "Новый сотрудник" };

export default async function NewEmployeePage() {
  await requirePageUser(["ADMIN"]);

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
        title="Создать сотрудника"
        subtitle="Телефон будет использоваться для входа сотрудника в систему"
      />

      <Card>
        <div className="mb-4 flex items-center gap-2 text-foam">
          <UserPlus className="h-5 w-5 text-aqua" />
          <h2 className="text-lg font-semibold">Личные данные и доступ</h2>
        </div>
        <EmployeeForm />
      </Card>
    </>
  );
}
