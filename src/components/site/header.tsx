"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, User2, Phone } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { ButtonLink } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/#services", label: "Услуги" },
  { href: "/#why", label: "Преимущества" },
  { href: "/#process", label: "Как мы работаем" },
  { href: "/#gallery", label: "Работы" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/#contacts", label: "Контакты" },
];

export function SiteHeader() {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cabinetHref = profile
    ? profile.role === "ADMIN"
      ? "/admin"
      : profile.role === "WORKER"
        ? "/worker"
        : "/cabinet"
    : "/login";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all",
        scrolled ? "glass border-b border-line/60" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-aqua to-aqua-deep">
            <span className="h-3.5 w-3.5 rounded-full bg-abyss" />
            <span className="absolute h-2 w-2 rounded-full bg-aqua" />
          </span>
          <span className="text-lg font-semibold tracking-[0.3em] text-foam">
            ОМУТ
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-mist transition-colors hover:text-foam"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={BUSINESS.phoneHref}
            className="flex items-center gap-2 text-sm text-mist hover:text-foam"
          >
            <Phone className="h-4 w-4" /> {BUSINESS.phone}
          </a>
          <ButtonLink href={cabinetHref} size="sm" variant="outline">
            <User2 className="h-4 w-4" />
            {profile ? "Кабинет" : "Войти"}
          </ButtonLink>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg text-foam lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Меню"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="glass border-t border-line/60 lg:hidden">
          <div className="flex flex-col gap-1 px-5 py-4">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-mist hover:bg-white/5 hover:text-foam"
              >
                {item.label}
              </a>
            ))}
            <ButtonLink href={cabinetHref} className="mt-2 w-full">
              <User2 className="h-4 w-4" />
              {profile ? "Личный кабинет" : "Войти"}
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
