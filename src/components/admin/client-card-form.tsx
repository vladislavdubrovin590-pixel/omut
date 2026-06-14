"use client";

import { useState, useTransition } from "react";
import { PhoneInput } from "@/components/ui/phone-input";
import { updateClientCard } from "@/lib/actions/admin";

type Client = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  note: string | null;
  bonusDiscountPercent: number;
};

export function ClientCardForm({ client }: { client: Client }) {
  const [message, setMessage] = useState<string | null>(null);
  const [phone, setPhone] = useState(client.phone ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-3"
      action={(formData) => {
        setMessage(null);
        startTransition(async () => {
          const result = await updateClientCard({
            userId: client.id,
            name: String(formData.get("name") ?? ""),
            phone: String(formData.get("phone") ?? ""),
            email: String(formData.get("email") ?? ""),
            note: String(formData.get("note") ?? ""),
            bonusDiscountPercent: Number(formData.get("bonusDiscountPercent") ?? 0),
          });
          setMessage(result.ok ? "Карточка сохранена" : result.error ?? "Ошибка");
        });
      }}
    >
      <label className="space-y-1 text-sm">
        <span className="text-mute">Имя</span>
        <input
          name="name"
          defaultValue={client.name ?? ""}
          className="w-full rounded-xl border border-line bg-abyss px-3 py-2 text-foam outline-none focus:border-aqua"
        />
      </label>
      <label className="space-y-1 text-sm">
        <span className="text-mute">Телефон</span>
        <PhoneInput
          name="phone"
          value={phone}
          onChange={setPhone}
          className="bg-abyss"
        />
      </label>
      <label className="space-y-1 text-sm">
        <span className="text-mute">Бонусная скидка, %</span>
        <input
          name="bonusDiscountPercent"
          type="number"
          min={0}
          max={100}
          defaultValue={client.bonusDiscountPercent}
          className="w-full rounded-xl border border-line bg-abyss px-3 py-2 text-foam outline-none focus:border-aqua"
        />
      </label>
      <label className="space-y-1 text-sm">
        <span className="text-mute">Email</span>
        <input
          name="email"
          type="email"
          defaultValue={client.email ?? ""}
          className="w-full rounded-xl border border-line bg-abyss px-3 py-2 text-foam outline-none focus:border-aqua"
        />
      </label>
      <label className="space-y-1 text-sm">
        <span className="text-mute">Специальные отметки</span>
        <textarea
          name="note"
          defaultValue={client.note ?? ""}
          className="min-h-32 w-full rounded-xl border border-line bg-abyss px-3 py-2 text-foam outline-none focus:border-aqua"
          placeholder="Предпочтения клиента, важные детали, ограничения, VIP/лояльность..."
        />
      </label>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <button
          className="rounded-xl bg-aqua px-4 py-3 text-sm font-semibold text-abyss disabled:opacity-60 sm:py-2"
          disabled={pending}
        >
          {pending ? "Сохраняю..." : "Сохранить карточку"}
        </button>
        {message && <span className="text-sm text-mist">{message}</span>}
      </div>
    </form>
  );
}
