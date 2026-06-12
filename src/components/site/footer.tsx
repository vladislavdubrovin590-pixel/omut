import Link from "next/link";
import { MapPin, Clock, Phone } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-abyss-2">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-aqua to-aqua-deep">
              <span className="h-3.5 w-3.5 rounded-full bg-abyss" />
            </span>
            <span className="text-lg font-semibold tracking-[0.3em]">ОМУТ</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-mute">
            {BUSINESS.fullName}. {BUSINESS.tagline}.
          </p>
        </div>

        <div className="space-y-3 text-sm text-mist">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-aqua" /> {BUSINESS.addressFull}
          </p>
          <p className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-aqua" /> {BUSINESS.hours}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-aqua" />
            <a href={BUSINESS.phoneHref} className="hover:text-foam">
              {BUSINESS.phone}
            </a>
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-medium text-foam">Навигация</p>
          <div className="flex flex-col gap-1.5 text-mist">
            <Link href="/#services" className="hover:text-foam">Услуги</Link>
            <Link href="/#gallery" className="hover:text-foam">Работы</Link>
            <Link href="/login" className="hover:text-foam">Личный кабинет</Link>
            <Link href="/cabinet/book" className="hover:text-foam">Онлайн-запись</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-mute">
        © {new Date().getFullYear()} {BUSINESS.fullName} · {BUSINESS.addressFull}
      </div>
    </footer>
  );
}
