"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/dashboard/ui";
import { saveService, deleteService, type ServiceInput } from "@/lib/actions/admin";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { formatRub } from "@/lib/utils";

type Svc = ServiceInput & { id: string };

export function ServicesManager({ services }: { services: Svc[] }) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAdding((v) => !v)}>
          {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {adding ? "Отмена" : "Новая услуга"}
        </Button>
      </div>

      {adding && (
        <ServiceEditor
          initial={{
            slug: "",
            title: "",
            shortDesc: "",
            category: "wash",
            basePrice: 0,
            durationMin: 60,
            active: true,
            popular: false,
            sortOrder: services.length * 10 + 10,
          }}
          onDone={() => setAdding(false)}
          isNew
        />
      )}

      {services.map((s) => (
        <ServiceEditor key={s.id} initial={s} />
      ))}
    </div>
  );
}

function ServiceEditor({
  initial,
  isNew,
  onDone,
}: {
  initial: ServiceInput;
  isNew?: boolean;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ServiceInput>(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(!!isNew);

  function set<K extends keyof ServiceInput>(k: K, v: ServiceInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setBusy(true);
    try {
      const res = await saveService(form);
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
        onDone?.();
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!initial.id) return;
    setBusy(true);
    try {
      await deleteService(initial.id);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foam">{form.title}</span>
            {!form.active && (
              <span className="rounded-full bg-mute/15 px-2 py-0.5 text-xs text-mute">скрыта</span>
            )}
            {form.popular && (
              <span className="rounded-full bg-aqua/15 px-2 py-0.5 text-xs text-aqua">хит</span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-mute">
            {SERVICE_CATEGORIES[form.category] ?? form.category} · от {formatRub(form.basePrice)}
          </p>
        </div>
        <Button size="sm" variant="subtle" onClick={() => setOpen(true)}>
          Изменить
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Название" value={form.title} onChange={(v) => set("title", v)} />
        <Input label="Slug (лат.)" value={form.slug} onChange={(v) => set("slug", v)} />
        <div className="sm:col-span-2">
          <Input
            label="Краткое описание"
            value={form.shortDesc ?? ""}
            onChange={(v) => set("shortDesc", v)}
          />
        </div>
        <div>
          <Label>Категория</Label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-foam outline-none focus:border-aqua/50"
          >
            {Object.entries(SERVICE_CATEGORIES).map(([k, v]) => (
              <option key={k} value={k} className="bg-surface">
                {v}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Цена от, ₽"
          type="number"
          value={String(form.basePrice)}
          onChange={(v) => set("basePrice", Number(v))}
        />
        <Input
          label="Длительность, мин"
          type="number"
          value={String(form.durationMin)}
          onChange={(v) => set("durationMin", Number(v))}
        />
        <Input
          label="Порядок"
          type="number"
          value={String(form.sortOrder)}
          onChange={(v) => set("sortOrder", Number(v))}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <Toggle label="Активна" checked={form.active} onChange={(v) => set("active", v)} />
        <Toggle label="Популярная" checked={form.popular} onChange={(v) => set("popular", v)} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button size="sm" onClick={save} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Сохранить
        </Button>
        {!isNew && (
          <>
            <Button size="sm" variant="subtle" onClick={() => setOpen(false)}>
              Свернуть
            </Button>
            <button
              onClick={remove}
              disabled={busy}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-mist hover:border-red-400/50 hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" /> Удалить
            </button>
          </>
        )}
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-teal">
            <Check className="h-4 w-4" /> Сохранено
          </span>
        )}
      </div>
    </Card>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs text-mute">{children}</label>;
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-foam outline-none focus:border-aqua/50"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-sm text-mist"
    >
      <span
        className={`grid h-5 w-5 place-items-center rounded-md border ${checked ? "border-aqua bg-aqua text-abyss" : "border-line"}`}
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
      {label}
    </button>
  );
}
