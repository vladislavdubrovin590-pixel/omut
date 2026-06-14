import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: {
    image: "h-10 w-32",
  },
  md: {
    image: "h-12 w-40",
  },
  lg: {
    image: "h-24 w-64",
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
          "relative grid shrink-0 place-items-center overflow-hidden drop-shadow-[0_0_18px_rgba(34,211,238,0.18)]",
          s.image,
        )}
      >
        <Image
          src="/brand-logo.png"
          alt="Омут"
          width={128}
          height={128}
          priority={size !== "sm"}
          className="h-full w-full object-contain"
        />
      </span>
    </Link>
  );
}
