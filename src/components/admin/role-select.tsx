"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { setUserRole } from "@/lib/actions/admin";
import type { Role } from "@prisma/client";

const ROLES: { value: Role; label: string }[] = [
  { value: "CLIENT", label: "Клиент" },
  { value: "WORKER", label: "Сотрудник" },
  { value: "ADMIN", label: "Администратор" },
];

export function RoleSelect({
  userId,
  role,
}: {
  userId: string;
  role: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(role);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  function change(next: string) {
    const prev = value;
    setValue(next);
    setError("");
    start(async () => {
      const res = await setUserRole(userId, next as Role);
      if (!res.ok) {
        setValue(prev);
        setError(res.error ?? "Ошибка");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {pending && <Loader2 className="h-4 w-4 animate-spin text-mute" />}
      <select
        value={value}
        onChange={(e) => change(e.target.value)}
        className="h-9 rounded-lg border border-line bg-surface px-3 text-xs text-foam outline-none focus:border-aqua/50"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value} className="bg-surface">
            {r.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
