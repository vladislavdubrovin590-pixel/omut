"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/dashboard/ui";
import { saveContent } from "@/lib/actions/admin";

type FieldDef = {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
};

const FIELDS: FieldDef[] = [
  { key: "hero.badge", label: "Плашка над главным заголовком" },
  { key: "hero.title", label: "Главный заголовок (Hero)", placeholder: "Глубокая забота о вашем автомобиле" },
  { key: "hero.subtitle", label: "Подзаголовок (Hero)", multiline: true },
  { key: "hero.stat1.value", label: "Преимущество 1 — значение" },
  { key: "hero.stat1.label", label: "Преимущество 1 — подпись" },
  { key: "hero.stat2.value", label: "Преимущество 2 — значение" },
  { key: "hero.stat2.label", label: "Преимущество 2 — подпись" },
  { key: "hero.stat3.value", label: "Преимущество 3 — значение" },
  { key: "hero.stat3.label", label: "Преимущество 3 — подпись" },
  { key: "hero.stat4.value", label: "Преимущество 4 — значение" },
  { key: "hero.stat4.label", label: "Преимущество 4 — подпись" },
  { key: "services.title", label: "Заголовок блока услуг" },
  { key: "services.subtitle", label: "Подзаголовок блока услуг", multiline: true },
  { key: "promotions.title", label: "Заголовок блока акций" },
  { key: "promotions.subtitle", label: "Подзаголовок блока акций", multiline: true },
  { key: "about.title", label: "Заголовок блока «О нас»" },
  { key: "about.text", label: "Текст блока «О нас»", multiline: true },
  { key: "about.feature1.title", label: "Преимущество «О нас» 1 — заголовок" },
  { key: "about.feature1.text", label: "Преимущество «О нас» 1 — текст", multiline: true },
  { key: "about.feature2.title", label: "Преимущество «О нас» 2 — заголовок" },
  { key: "about.feature2.text", label: "Преимущество «О нас» 2 — текст", multiline: true },
  { key: "about.feature3.title", label: "Преимущество «О нас» 3 — заголовок" },
  { key: "about.feature3.text", label: "Преимущество «О нас» 3 — текст", multiline: true },
  { key: "process.title", label: "Заголовок блока процесса" },
  { key: "process.step1.title", label: "Шаг 1 — заголовок" },
  { key: "process.step1.text", label: "Шаг 1 — текст", multiline: true },
  { key: "process.step2.title", label: "Шаг 2 — заголовок" },
  { key: "process.step2.text", label: "Шаг 2 — текст", multiline: true },
  { key: "process.step3.title", label: "Шаг 3 — заголовок" },
  { key: "process.step3.text", label: "Шаг 3 — текст", multiline: true },
  { key: "process.step4.title", label: "Шаг 4 — заголовок" },
  { key: "process.step4.text", label: "Шаг 4 — текст", multiline: true },
  { key: "gallery.title", label: "Заголовок галереи" },
  { key: "reviews.title", label: "Заголовок отзывов" },
  { key: "contacts.address", label: "Адрес (контакты)" },
  { key: "contacts.hours", label: "Часы работы" },
  { key: "contacts.landmark", label: "Ориентир рядом" },
  { key: "cta.title", label: "Финальный CTA — заголовок" },
  { key: "cta.text", label: "Финальный CTA — текст", multiline: true },
  { key: "cta.trust1", label: "Финальный CTA — доверие 1" },
  { key: "cta.trust2", label: "Финальный CTA — доверие 2" },
  { key: "cta.trust3", label: "Финальный CTA — доверие 3" },
];

export function ContentEditor({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const f of FIELDS) v[f.key] = initial[f.key] ?? "";
    return v;
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setBusy(true);
    setSaved(false);
    try {
      const res = await saveContent(values);
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <div className="space-y-4">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="mb-1.5 block text-sm text-mist">{f.label}</label>
            {f.multiline ? (
              <textarea
                rows={3}
                value={values[f.key]}
                placeholder={f.placeholder}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-foam outline-none focus:border-aqua/50"
              />
            ) : (
              <input
                value={values[f.key]}
                placeholder={f.placeholder}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                className="h-11 w-full rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={save} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Сохранить контент
        </Button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-teal">
            <Check className="h-4 w-4" /> Сохранено
          </span>
        )}
        <span className="text-xs text-mute">Пустое поле = значение по умолчанию</span>
      </div>
    </Card>
  );
}
