import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: {
    frame: "h-10 w-32",
  },
  md: {
    frame: "h-12 w-40",
  },
  lg: {
    frame: "h-20 w-64",
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
          "relative grid shrink-0 place-items-center overflow-visible drop-shadow-[0_0_16px_rgba(34,211,238,0.26)]",
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
