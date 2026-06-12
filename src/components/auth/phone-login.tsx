"use client";

import { useState } from "react";
import { Bell, Loader2, Phone, KeyRound, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

type Step = "phone" | "code";

export function PhoneLogin({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  async function sendCode() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/phone/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось отправить код");
        return;
      }
      setNormalizedPhone(data.phone);
      setStep("code");
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch {
      setError("Ошибка сети. Проверьте интернет.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizedPhone || phone,
          code,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Неверный код");
        return;
      }
      await refreshProfile();
      onSuccess?.();
    } catch {
      setError("Ошибка входа");
    } finally {
      setBusy(false);
    }
  }

  if (step === "phone") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-mist">
          Введите номер телефона — код придёт push-уведомлением на уже
          привязанное устройство. Почта, Google и SMS не нужны.
        </p>
        <div className="rounded-xl border border-aqua/20 bg-aqua/10 p-3 text-xs text-mist">
          Первый вход делается в студии: сотрудник создаёт клиента, клиент
          открывает кабинет и включает push-уведомления. После этого вход по
          номеру работает через push-код.
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 focus-within:border-aqua/50">
          <Phone className="h-4 w-4 shrink-0 text-mute" />
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+7 900 123-45-67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 w-full bg-transparent text-sm text-foam outline-none placeholder:text-mute"
          />
        </div>
        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <Button type="button" className="w-full" onClick={sendCode} disabled={busy || !phone.trim()}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Получить push-код
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={verifyCode} className="space-y-4">
      <button
        type="button"
        onClick={() => {
          setStep("phone");
          setCode("");
          setError("");
        }}
        className="inline-flex items-center gap-1.5 text-sm text-mist hover:text-foam"
      >
        <ArrowLeft className="h-4 w-4" /> Изменить номер
      </button>

      <p className="text-sm text-mist">
        Код отправлен push-уведомлением для{" "}
        <span className="text-foam">{normalizedPhone || phone}</span>
        {countdown > 0 && (
          <span className="text-mute"> · повтор через {countdown} сек</span>
        )}
      </p>

      <p className="flex items-start gap-2 rounded-lg bg-aqua/10 px-3 py-2 text-xs text-mist">
        <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-aqua" />
        Если уведомление не пришло, проверьте разрешение уведомлений для сайта
        и повторите отправку.
      </p>

      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 focus-within:border-aqua/50">
        <KeyRound className="h-4 w-4 shrink-0 text-mute" />
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="6 цифр из push"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="h-12 w-full bg-transparent text-center text-lg tracking-[0.4em] text-foam outline-none placeholder:text-sm placeholder:tracking-normal placeholder:text-mute"
          autoFocus
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={busy || code.length !== 6}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Войти
      </Button>

      {countdown === 0 && (
        <button
          type="button"
          onClick={sendCode}
          disabled={busy}
          className="w-full text-center text-sm text-aqua hover:underline"
        >
          Отправить push-код повторно
        </button>
      )}
    </form>
  );
}
