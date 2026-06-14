import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: {
    frame: "h-14 w-36 p-2",
  },
  md: {
    frame: "h-16 w-44 p-2.5",
  },
  lg: {
    frame: "h-32 w-80 p-4",
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
    <Link href="/" className={cn("group block", className)} aria-label="Омут">
      <span
        className={cn(
          "relative grid shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_16px_36px_-24px_rgba(255,255,255,0.65)]",
          s.frame,
        )}
      >
        <Image
          src="/brand-logo.png"
          alt="Омут"
          width={720}
          height={460}
          priority={size !== "sm"}
          className="h-full w-full object-contain"
        />
      </span>
    </Link>
  );
}
