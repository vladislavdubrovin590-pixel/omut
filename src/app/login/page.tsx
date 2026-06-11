"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User2, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";

function mapError(code: string): string {
  if (code.includes("auth/invalid-credential") || code.includes("wrong-password"))
    return "Неверный email или пароль.";
  if (code.includes("email-already-in-use")) return "Этот email уже зарегистрирован.";
  if (code.includes("weak-password")) return "Пароль слишком простой (минимум 6 символов).";
  if (code.includes("invalid-email")) return "Некорректный email.";
  if (code.includes("popup-closed")) return "Окно входа было закрыто.";
  if (code.includes("operation-not-allowed"))
    return "Способ входа не включён в Firebase. Включите Email/Google в консоли.";
  return "Не удалось выполнить вход. Попробуйте ещё раз.";
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-abyss-glow min-h-screen" />}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const { profile, signInEmail, registerEmail, signInGoogle } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") await signInEmail(email, password);
      else await registerEmail(email, password, name);
    } catch (err) {
      setError(mapError(err instanceof Error ? err.message : String(err)));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setBusy(true);
    try {
      await signInGoogle();
    } catch (err) {
      setError(mapError(err instanceof Error ? err.message : String(err)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bg-abyss-glow flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-mist hover:text-foam"
        >
          <ArrowLeft className="h-4 w-4" /> На главную
        </Link>

        <div className="glass rounded-3xl p-8">
          <div className="text-center">
            <div className="mx-auto flex w-fit items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-aqua to-aqua-deep">
                <span className="h-3.5 w-3.5 rounded-full bg-abyss" />
              </span>
              <span className="text-lg font-semibold tracking-[0.3em]">ОМУТ</span>
            </div>
            <h1 className="mt-5 text-2xl font-semibold">
              {mode === "login" ? "Вход в кабинет" : "Регистрация"}
            </h1>
            <p className="mt-2 text-sm text-mute">
              {BUSINESS.fullName}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 rounded-full border border-line p-1 text-sm">
            <button
              onClick={() => setMode("login")}
              className={`rounded-full py-2 transition-colors ${mode === "login" ? "bg-aqua text-abyss font-medium" : "text-mist"}`}
            >
              Вход
            </button>
            <button
              onClick={() => setMode("register")}
              className={`rounded-full py-2 transition-colors ${mode === "register" ? "bg-aqua text-abyss font-medium" : "text-mist"}`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            {mode === "register" && (
              <Field
                icon={<User2 className="h-4 w-4" />}
                placeholder="Имя"
                value={name}
                onChange={setName}
                type="text"
              />
            )}
            <Field
              icon={<Mail className="h-4 w-4" />}
              placeholder="Email"
              value={email}
              onChange={setEmail}
              type="email"
            />
            <Field
              icon={<Lock className="h-4 w-4" />}
              placeholder="Пароль"
              value={password}
              onChange={setPassword}
              type="password"
            />

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Войти" : "Создать аккаунт"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-mute">
            <span className="h-px flex-1 bg-line" /> или <span className="h-px flex-1 bg-line" />
          </div>

          <Button
            type="button"
            variant="subtle"
            className="w-full"
            onClick={handleGoogle}
            disabled={busy}
          >
            <GoogleIcon /> Продолжить с Google
          </Button>
        </div>
      </div>
    </main>
  );
}

function Field({
  icon,
  placeholder,
  value,
  onChange,
  type,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 focus-within:border-aqua/50">
      <span className="text-mute">{icon}</span>
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full bg-transparent text-sm text-foam outline-none placeholder:text-mute"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
