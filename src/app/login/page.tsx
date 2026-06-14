"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Lock, Phone } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { BrandLogo } from "@/components/site/brand-logo";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-abyss-glow min-h-screen" />}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const { profile, refreshProfile } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const next = params.get("next");

  useEffect(() => {
    if (profile) {
      const dest =
        next ??
        (profile.role === "ADMIN"
          ? "/admin"
          : profile.role === "WORKER"
            ? "/worker"
            : "/cabinet");
      router.replace(dest);
    }
  }, [profile, next, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось войти");
        return;
      }
      await refreshProfile();
      const dest =
        next ??
        (data.user.role === "ADMIN"
          ? "/admin"
          : data.user.role === "WORKER"
            ? "/worker"
            : "/cabinet");
      router.replace(dest);
    } catch {
      setError("Ошибка входа. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bg-abyss-glow flex min-h-screen items-center justify-center px-4 py-8 sm:px-5 sm:py-16">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-mist hover:text-foam"
        >
          <ArrowLeft className="h-4 w-4" /> На главную
        </Link>

        <div className="glass rounded-3xl p-5 sm:p-8">
          <div className="text-center">
            <BrandLogo size="lg" className="mx-auto" />
            <h1 className="mt-7 text-2xl font-semibold">
              Вход в кабинет
            </h1>
            <p className="mt-2 text-sm text-mute">
              Клиент, сотрудник и администратор входят по телефону и паролю.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 focus-within:border-aqua/50">
              <span className="text-mute">
                <Phone className="h-4 w-4" />
              </span>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                autoComplete="tel"
                required
                className="h-12 border-0 bg-transparent px-0 focus:border-transparent"
              />
            </div>
            <Field
              icon={<Lock className="h-4 w-4" />}
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={busy || !phone.trim() || !password}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Войти
            </Button>

            <div className="rounded-xl border border-line bg-surface/50 p-3 text-xs text-mute">
              Тестовые аккаунты созданы для проверки ролей. После запуска
              реальные аккаунты клиентов создаёт администратор или сотрудник.
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function Field({
  icon,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 focus-within:border-aqua/50">
      <span className="text-mute">{icon}</span>
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full bg-transparent text-sm text-foam outline-none placeholder:text-mute"
      />
    </div>
  );
}
