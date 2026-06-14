import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: {
    root: "gap-2",
    mark: "h-9 w-9",
    title: "text-base",
    subtitle: "text-[8px]",
  },
  md: {
    root: "gap-2.5",
    mark: "h-10 w-10",
    title: "text-lg",
    subtitle: "text-[9px]",
  },
  lg: {
    root: "flex-col gap-3 text-center",
    mark: "h-20 w-20",
    title: "text-3xl",
    subtitle: "text-xs",
  },
};

export function BrandLogo({
  size = "md",
  className,
}: {
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  const s = sizeMap[size];
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex shrink-0 items-center",
        s.root,
        className,
      )}
      aria-label="Омут"
    >
      <span
        className={cn(
          "relative grid shrink-0 place-items-center overflow-hidden rounded-2xl border border-aqua/25 bg-gradient-to-br from-aqua/14 via-surface/75 to-teal/10 shadow-[0_0_28px_-18px_rgba(34,211,238,0.95)] transition-colors group-hover:border-aqua/45",
          s.mark,
        )}
      >
        <Image
          src="/brand-mark-clean.png"
          alt="Омут"
          width={512}
          height={512}
          priority={size !== "sm"}
          className="h-[82%] w-[82%] object-contain"
        />
      </span>
      <span className={cn("leading-none", size === "lg" ? "" : "text-left")}>
        <span
          className={cn(
            "block font-black tracking-[0.08em] text-foam",
            s.title,
          )}
        >
          ОМУТ
        </span>
        <span
          className={cn(
            "mt-1 block font-semibold uppercase tracking-[0.18em] text-aqua/90",
            s.subtitle,
          )}
        >
          Детейлинг студия
        </span>
      </span>
    </Link>
  );
}
