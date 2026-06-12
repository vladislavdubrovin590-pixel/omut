import { Users } from "lucide-react";
import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeading } from "@/components/dashboard/ui";
import { RoleSelect } from "@/components/admin/role-select";
import { formatDate, formatRub } from "@/lib/utils";

export const metadata = { title: "Клиенты" };

export default async function AdminClients() {
  await requirePageUser(["ADMIN"]);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bookings: true } },
      visits: { where: { status: "COMPLETED" }, select: { totalAmount: true } },
    },
    take: 300,
  });

  return (
    <>
      <PageHeading
        title="Клиенты и команда"
        subtitle={`Всего пользователей: ${users.length}`}
      />

      {users.length === 0 ? (
        <EmptyState title="Пользователей пока нет" icon={<Users className="h-8 w-8" />} />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-mute">
                <th className="px-4 py-3 font-medium">Клиент</th>
                <th className="px-4 py-3 font-medium">Контакты</th>
                <th className="px-4 py-3 font-medium">Записей</th>
                <th className="px-4 py-3 font-medium">Сумма</th>
                <th className="px-4 py-3 font-medium">С нами с</th>
                <th className="px-4 py-3 font-medium">Роль</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const spent = u.visits.reduce((s, v) => s + v.totalAmount, 0);
                return (
                  <tr key={u.id} className="border-b border-line/50 last:border-0">
                    <td className="px-4 py-3 text-foam">{u.name ?? "—"}</td>
                    <td className="px-4 py-3 text-mist">
                      <div>{u.phone ?? "—"}</div>
                      {u.email && <div className="text-xs text-mute">{u.email}</div>}
                    </td>
                    <td className="px-4 py-3 text-mist">{u._count.bookings}</td>
                    <td className="px-4 py-3 text-teal">{formatRub(spent)}</td>
                    <td className="px-4 py-3 text-mute">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <RoleSelect userId={u.id} role={u.role} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
