"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { AlertModal } from "@/components/ui/alert-modal";
import { savePromotion } from "@/lib/actions/admin";
import { Card } from "@/components/dashboard/ui";

type PromotionRow = {
  id: string;
  title: string;
  description: string | null;
  discountPercent: number;
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
};

function dateValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export function PromotionsManager({ promotions }: { promotions: PromotionRow[] }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function submit(formData: FormData, id?: string) {
    setMessage("");
    setError("");
    startTransition(async () => {
      const result = await savePromotion({
        id,
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        discountPercent: Number(formData.get("discountPercent") ?? 0),
        active: formData.get("active") === "on",
        startsAt: String(formData.get("startsAt") ?? "") || undefined,
        endsAt: String(formData.get("endsAt") ?? "") || undefined,
      });
      if (result.ok) setMessage("Сохранено");
      else setError(result.error ?? "Ошибка сохранения акции");
    });
  }

  return (
    <div className="space-y-4">
      <AlertModal
        title="Акция не сохранена"
        message={error}
        onClose={() => setError("")}
      />

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-foam">Новая акция</h2>
        <PromotionForm pending={pending} onSubmit={(fd) => submit(fd)} />
      </Card>

      {promotions.map((promotion) => (
        <Card key={promotion.id}>
          <PromotionForm
            promotion={promotion}
            pending={pending}
            onSubmit={(fd) => submit(fd, promotion.id)}
          />
        </Card>
      ))}

      {message && <p className="text-sm text-mist">{message}</p>}
    </div>
  );
}

function PromotionForm({
  promotion,
  pending,
  onSubmit,
}: {
  promotion?: PromotionRow;
  pending: boolean;
  onSubmit: (formData: FormData) => void;
}) {
  return (
    <form action={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <input
        name="title"
        defaultValue={promotion?.title ?? ""}
        placeholder="Название акции"
        className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-foam outline-none focus:border-aqua/50"
        required
      />
      <input
        name="discountPercent"
        type="number"
        min={0}
        max={100}
        defaultValue={promotion?.discountPercent ?? 10}
        placeholder="Скидка, %"
        className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-foam outline-none focus:border-aqua/50"
      />
      <input
        name="startsAt"
        type="date"
        defaultValue={dateValue(promotion?.startsAt ?? null)}
        className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-foam outline-none focus:border-aqua/50"
      />
      <input
        name="endsAt"
        type="date"
        defaultValue={dateValue(promotion?.endsAt ?? null)}
        className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-foam outline-none focus:border-aqua/50"
      />
      <textarea
        name="description"
        defaultValue={promotion?.description ?? ""}
        placeholder="Описание условий"
        className="min-h-24 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-foam outline-none focus:border-aqua/50 sm:col-span-2"
      />
      <label className="flex items-center gap-2 text-sm text-mist">
        <input name="active" type="checkbox" defaultChecked={promotion?.active ?? true} />
        Активна
      </label>
      <button
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-aqua px-4 py-2 text-sm font-semibold text-abyss disabled:opacity-60 sm:justify-self-end"
        disabled={pending}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Сохранить
      </button>
    </form>
  );
}
