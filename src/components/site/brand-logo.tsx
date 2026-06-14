import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: {
    image: "h-10 w-28",
  },
  md: {
    image: "h-12 w-36",
  },
  lg: {
    image: "h-20 w-56",
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
          "relative grid shrink-0 place-items-center overflow-hidden rounded-xl border border-aqua/20 bg-white/5 shadow-[0_0_28px_-16px_rgba(34,211,238,0.9)]",
          s.image,
        )}
      >
        <Image
          src="/brand-logo.png"
          alt="Омут"
          width={128}
          height={128}
          priority={size !== "sm"}
          className="h-full w-full object-contain p-1"
        />
      </span>
    </Link>
  );
}
