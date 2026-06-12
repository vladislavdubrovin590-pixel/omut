import { cn } from "@/lib/utils";

export function PageHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foam">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-mute">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-surface/60 p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface/60 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-mute">
          {label}
        </span>
        {icon && <span className="text-aqua">{icon}</span>}
      </div>
      <div className="mt-2 text-2xl font-semibold text-foam">{value}</div>
      {hint && <div className="mt-1 text-xs text-mute">{hint}</div>}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-300",
  CONFIRMED: "bg-aqua/15 text-aqua",
  IN_PROGRESS: "bg-azure/15 text-azure",
  COMPLETED: "bg-teal/15 text-teal",
  CANCELLED: "bg-red-500/15 text-red-300",
  NO_SHOW: "bg-mute/15 text-mute",
};

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status] ?? "bg-white/10 text-mist",
      )}
    >
      {label}
    </span>
  );
}

export function EmptyState({
  title,
  hint,
  icon,
}: {
  title: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface/30 p-10 text-center">
      {icon && <div className="mx-auto mb-3 w-fit text-mute">{icon}</div>}
      <p className="text-foam">{title}</p>
      {hint && <p className="mt-1 text-sm text-mute">{hint}</p>}
    </div>
  );
}
