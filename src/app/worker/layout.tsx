import { requirePageUser } from "@/lib/guards";
import { Sidebar, type NavItem } from "@/components/dashboard/sidebar";

const NAV: NavItem[] = [
  { href: "/worker", label: "Приёмка", icon: "ClipboardCheck" },
  { href: "/cabinet", label: "Мой кабинет", icon: "LayoutDashboard" },
];

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageUser(["WORKER", "ADMIN"]);
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar title="Рабочее место" items={NAV} userName={user.name ?? user.email} />
      <main className="flex-1 px-4 pb-28 pt-6 sm:px-5 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
