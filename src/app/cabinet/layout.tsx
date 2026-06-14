import { requirePageUser } from "@/lib/guards";
import { Sidebar, type NavItem } from "@/components/dashboard/sidebar";

const NAV: NavItem[] = [
  { href: "/cabinet", label: "Обзор", icon: "LayoutDashboard" },
  { href: "/cabinet/book", label: "Записаться", icon: "CalendarPlus" },
  { href: "/cabinet/bookings", label: "Мои записи", icon: "CalendarClock" },
  { href: "/cabinet/history", label: "История", icon: "History" },
  { href: "/cabinet/profile", label: "Профиль", icon: "User2" },
];

export default async function CabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageUser();
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar title="Личный кабинет" items={NAV} userName={user.name ?? user.email} />
      <main className="flex-1 px-5 py-8 lg:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
