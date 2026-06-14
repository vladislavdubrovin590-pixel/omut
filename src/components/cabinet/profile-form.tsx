"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { updateProfile } from "@/lib/actions/profile";

export function ProfileForm({
  initialName,
  initialPhone,
}: {
  initialName: string;
  initialPhone: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    try {
      await updateProfile({ name, phone });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm text-mist">Имя</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
          placeholder="Ваше имя"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-mist">Телефон</label>
        <PhoneInput
          value={phone}
          onChange={setPhone}
          placeholder="+7 ..."
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Сохранить
        </Button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-teal">
            <Check className="h-4 w-4" /> Сохранено
          </span>
        )}
      </div>
    </form>
  );
}
