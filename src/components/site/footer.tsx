import Link from "next/link";
import { MapPin, Clock, Phone } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import { BrandLogo } from "@/components/site/brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-abyss-2">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-5 sm:py-14 md:grid-cols-3">
        <div>
          <BrandLogo size="md" />
          <p className="mt-4 max-w-xs text-sm text-mute">
            {BUSINESS.fullName}. {BUSINESS.tagline}.
          </p>
        </div>

        <div className="space-y-3 text-sm text-mist">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-aqua" /> {BUSINESS.addressFull}
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
      <div className="border-t border-line px-4 py-5 pb-[calc(6rem+env(safe-area-inset-bottom))] text-center text-xs text-mute lg:pb-5">
        © {new Date().getFullYear()} {BUSINESS.fullName} · {BUSINESS.addressFull}
      </div>
    </footer>
  );
}
