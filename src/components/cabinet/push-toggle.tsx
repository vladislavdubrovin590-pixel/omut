"use client";

import { useState } from "react";
import { Bell, BellOff, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isPushConfigured, requestPushToken } from "@/lib/firebase/messaging";
import { registerPushToken } from "@/lib/actions/push";

export function PushToggle() {
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<"idle" | "on" | "denied" | "error">("idle");

  async function enable() {
    setBusy(true);
    try {
      const token = await requestPushToken();
      if (!token) {
        setState("denied");
        return;
      }
      const res = await registerPushToken(token);
      setState(res.ok ? "on" : "error");
    } catch {
      setState("error");
    } finally {
      setBusy(false);
    }
  }

  if (!isPushConfigured) {
    return (
      <div className="flex items-center gap-2 text-sm text-mute">
        <BellOff className="h-4 w-4" />
        Push-уведомления станут доступны после настройки Firebase (VAPID-ключ).
      </div>
    );
  }

  if (state === "on") {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-teal">
        <Check className="h-4 w-4" /> Уведомления включены
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button onClick={enable} variant="outline" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
        Включить уведомления
      </Button>
      {state === "denied" && (
        <p className="text-xs text-amber-300">
          Разрешение не выдано. Включите уведомления для сайта в настройках браузера.
        </p>
      )}
      {state === "error" && (
        <p className="text-xs text-red-300">Не удалось включить уведомления.</p>
      )}
    </div>
  );
}
