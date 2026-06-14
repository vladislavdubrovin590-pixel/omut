"use client";

import { useState, useTransition } from "react";
import type { Role } from "@prisma/client";
import { saveEmployee } from "@/lib/actions/admin";

type Employee = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  role: Role;
  note: string | null;
};

export function EmployeeForm({ employee }: { employee?: Employee }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-3 rounded-2xl border border-line bg-white/[0.03] p-3 sm:p-4 md:grid-cols-2"
      action={(formData) => {
        setMessage(null);
        startTransition(async () => {
          const result = await saveEmployee({
            id: employee?.id,
            name: String(formData.get("name") ?? ""),
            phone: String(formData.get("phone") ?? ""),
            email: String(formData.get("email") ?? ""),
            role: String(formData.get("role") ?? "WORKER") as "WORKER" | "ADMIN",
            password: String(formData.get("password") ?? ""),
            note: String(formData.get("note") ?? ""),
          });
          setMessage(result.ok ? "Сохранено" : result.error ?? "Ошибка сохранения");
        });
      }}
    >
      <label className="space-y-1 text-sm">
        <span className="text-mute">Имя</span>
        <input
          name="name"
          defaultValue={employee?.name ?? ""}
          className="w-full rounded-xl border border-line bg-abyss px-3 py-2 text-foam outline-none focus:border-aqua"
          required
        />
      </label>
      <label className="space-y-1 text-sm">
        <span className="text-mute">Телефон</span>
        <input
          name="phone"
          defaultValue={employee?.phone ?? ""}
          className="w-full rounded-xl border border-line bg-abyss px-3 py-2 text-foam outline-none focus:border-aqua"
          placeholder="+7..."
          required
        />
      </label>
      <label className="space-y-1 text-sm">
        <span className="text-mute">Email</span>
        <input
          name="email"
          type="email"
          defaultValue={employee?.email ?? ""}
          className="w-full rounded-xl border border-line bg-abyss px-3 py-2 text-foam outline-none focus:border-aqua"
        />
      </label>
      <label className="space-y-1 text-sm">
        <span className="text-mute">Права</span>
        <select
          name="role"
          defaultValue={employee?.role ?? "WORKER"}
          className="w-full rounded-xl border border-line bg-abyss px-3 py-2 text-foam outline-none focus:border-aqua"
        >
          <option value="WORKER">Сотрудник</option>
          <option value="ADMIN">Администратор</option>
        </select>
      </label>
      <label className="space-y-1 text-sm md:col-span-2">
        <span className="text-mute">
          {employee ? "Новый пароль, если нужно сменить" : "Пароль"}
        </span>
        <input
          name="password"
          type="password"
          className="w-full rounded-xl border border-line bg-abyss px-3 py-2 text-foam outline-none focus:border-aqua"
          minLength={employee ? undefined : 6}
          required={!employee}
        />
      </label>
      <label className="space-y-1 text-sm md:col-span-2">
        <span className="text-mute">Внутренние заметки</span>
        <textarea
          name="note"
          defaultValue={employee?.note ?? ""}
          className="min-h-20 w-full rounded-xl border border-line bg-abyss px-3 py-2 text-foam outline-none focus:border-aqua"
        />
      </label>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center md:col-span-2">
        <button
          className="rounded-xl bg-aqua px-4 py-3 text-sm font-semibold text-abyss disabled:opacity-60 sm:py-2"
          disabled={pending}
        >
          {pending ? "Сохраняю..." : "Сохранить"}
        </button>
        {message && <span className="text-sm text-mist">{message}</span>}
      </div>
    </form>
  );
}
