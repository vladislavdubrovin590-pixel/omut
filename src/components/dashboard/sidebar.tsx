"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { LogOut, type LucideIcon } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function Sidebar({
  title,
  items,
  userName,
}: {
  title: string;
  items: NavItem[];
  userName: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <aside className="flex w-full flex-row gap-1 overflow-x-auto border-b border-line bg-abyss-2 p-3 lg:h-screen lg:w-64 lg:flex-col lg:gap-1 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="hidden px-3 py-4 lg:block">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-aqua to-aqua-deep">
            <span className="h-3 w-3 rounded-full bg-abyss" />
          </span>
          <span className="text-base font-semibold tracking-[0.25em]">ОМУТ</span>
        </Link>
        <p className="mt-3 text-xs uppercase tracking-wide text-mute">{title}</p>
      </div>

      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/cabinet" &&
            item.href !== "/admin" &&
            item.href !== "/worker" &&
            pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors",
              active
                ? "bg-aqua/15 text-aqua"
                : "text-mist hover:bg-white/5 hover:text-foam",
            )}
          >
            <item.icon className="h-4.5 w-4.5" />
            <span className="whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}

      <div className="mt-auto hidden pt-4 lg:block">
        <div className="truncate px-4 text-xs text-mute">{userName}</div>
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-mist transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4.5 w-4.5" /> Выйти
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="ml-auto flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-mist hover:text-red-300 lg:hidden"
      >
        <LogOut className="h-4.5 w-4.5" />
      </button>
    </aside>
  );
}
