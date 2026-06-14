"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/dashboard/ui";
import { sendBroadcast } from "@/lib/actions/push";
import type { PushAudience } from "@prisma/client";

export function PushSender({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [audience, setAudience] = useState<PushAudience>("ALL");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState("");

  async function send() {
    setError("");
    setResult("");
    if (!title.trim() || !body.trim()) {
      setError("Заполните заголовок и текст");
      return;
    }
    setBusy(true);
    try {
      const res = await sendBroadcast(
        { title: title.trim(), body: body.trim(), url: url.trim() || undefined },
        audience,
      );
      if (res.ok) {
        setResult(`Отправлено: ${res.sent}, ошибок: ${res.failed}`);
        setTitle("");
        setBody("");
        setUrl("");
        router.refresh();
      }
    } catch {
      setError(
        "Не удалось отправить. Нужен Firebase service account и подписки клиентов.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className="mb-1 text-lg font-semibold">Новая рассылка</h2>
      {!configured && (
        <p className="mb-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          Push заработает после добавления Firebase service account и VAPID-ключа.
          Форму уже можно заполнять.
        </p>
      )}
      <div className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Заголовок"
          className="h-11 w-full rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Текст уведомления"
          rows={3}
          className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-foam outline-none focus:border-aqua/50"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Ссылка (по умолч. /cabinet)"
            className="h-11 rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
          />
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as PushAudience)}
            className="h-11 rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
          >
            <option value="ALL" className="bg-surface">Все подписчики</option>
            <option value="CLIENT" className="bg-surface">Только клиенты</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Button onClick={send} disabled={busy} className="w-full sm:w-auto">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Отправить
        </Button>
        {result && (
          <span className="inline-flex items-center gap-1 text-sm text-teal">
            <Check className="h-4 w-4" /> {result}
          </span>
        )}
        {error && <span className="text-sm text-red-300">{error}</span>}
      </div>
    </Card>
  );
}
