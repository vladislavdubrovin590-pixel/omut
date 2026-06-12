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
  { key: "hero.title", label: "Главный заголовок (Hero)", placeholder: "Глубокая забота о вашем автомобиле" },
  { key: "hero.subtitle", label: "Подзаголовок (Hero)", multiline: true },
  { key: "about.title", label: "Заголовок блока «О нас»" },
  { key: "about.text", label: "Текст блока «О нас»", multiline: true },
  { key: "contacts.address", label: "Адрес (контакты)" },
  { key: "contacts.hours", label: "Часы работы" },
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
