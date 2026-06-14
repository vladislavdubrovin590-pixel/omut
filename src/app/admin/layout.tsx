import { requirePageUser } from "@/lib/guards";
import { Sidebar, type NavItem } from "@/components/dashboard/sidebar";

const NAV: NavItem[] = [
  { href: "/admin", label: "Аналитика", icon: "BarChart3" },
  { href: "/admin/bookings", label: "Записи", icon: "CalendarDays" },
  { href: "/admin/clients", label: "Клиенты", icon: "Users" },
  { href: "/admin/services", label: "Услуги", icon: "Wrench" },
  { href: "/admin/content", label: "Контент", icon: "FileText" },
  { href: "/admin/reviews", label: "Отзывы", icon: "Star" },
  { href: "/admin/push", label: "Уведомления", icon: "Bell" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageUser(["ADMIN"]);
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar title="Администрирование" items={NAV} userName={user.name ?? user.email} />
      <main className="flex-1 px-5 py-8 lg:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
