"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CarCatalogFields } from "@/components/cars/car-catalog-fields";
import { createBooking } from "@/lib/actions/booking";
import { formatRub, BODY_CLASS_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ServiceOpt = {
  id: string;
  slug?: string;
  title: string;
  category: string;
  basePrice: number;
  durationMin: number;
};

type CarOpt = {
  id: string;
  make: string;
  model: string;
  plate: string | null;
};

const CAT_LABELS: Record<string, string> = {
  wash: "Мойка",
  polish: "Полировка",
  protection: "Защитные покрытия",
  interior: "Уход за салоном",
  complex: "Комплексы",
  other: "Другое",
};

export function BookingForm({
  services,
  cars,
  initialServiceSlug,
}: {
  services: ServiceOpt[];
  cars: CarOpt[];
  initialServiceSlug?: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(
    () =>
      new Set(
        initialServiceSlug
          ? services
              .filter((s) => s.slug === initialServiceSlug)
              .map((s) => s.id)
          : [],
      ),
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [carId, setCarId] = useState("");
  const [bodyClass, setBodyClass] = useState("B");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const grouped = useMemo(() => {
    const m = new Map<string, ServiceOpt[]>();
    for (const s of services) {
      if (!m.has(s.category)) m.set(s.category, []);
      m.get(s.category)!.push(s);
    }
    return [...m.entries()];
  }, [services]);

  const total = useMemo(
    () =>
      services
        .filter((s) => selected.has(s.id))
        .reduce((sum, s) => sum + s.basePrice, 0),
    [services, selected],
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (selected.size === 0) return setError("Выберите хотя бы одну услугу");
    if (!date || !time) return setError("Укажите дату и время");
    setBusy(true);
    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      const res = await createBooking({
        serviceIds: [...selected],
        scheduledAt,
        note: note || undefined,
        carId: carId || undefined,
        car: make && model ? { make, model, plate, bodyClass: bodyClass as never } : undefined,
      });
      if (!res.ok) {
        setError(res.error ?? "Не удалось создать запись");
      } else {
        setDone(true);
        setTimeout(() => router.push("/cabinet/bookings"), 1200);
      }
    } catch {
      setError("Не удалось создать запись. Войдите в аккаунт и попробуйте снова.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-teal/30 bg-teal/10 p-10 text-center">
        <CalendarCheck className="mx-auto h-10 w-10 text-teal" />
        <p className="mt-3 text-lg font-medium text-foam">Запись создана!</p>
        <p className="mt-1 text-sm text-mist">
          Мы свяжемся для подтверждения. Переносим вас к списку записей…
        </p>
      </div>
    );
  }

  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={submit} className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold">1. Выберите услуги</h2>
        <div className="space-y-5">
          {grouped.map(([cat, list]) => (
            <div key={cat}>
              <p className="mb-2 text-xs uppercase tracking-wide text-mute">
                {CAT_LABELS[cat] ?? cat}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {list.map((s) => {
                  const on = selected.has(s.id);
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => toggle(s.id)}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors",
                        on
                          ? "border-aqua bg-aqua/10"
                          : "border-line bg-surface/60 hover:border-aqua/40",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={cn(
                            "grid h-5 w-5 place-items-center rounded-md border",
                            on ? "border-aqua bg-aqua text-abyss" : "border-line",
                          )}
                        >
                          {on && <Check className="h-3.5 w-3.5" />}
                        </span>
                        <span>
                          <span className="block text-sm text-foam">{s.title}</span>
                          <span className="block text-xs text-mute">
                            ~{Math.round(s.durationMin / 60)} ч
                          </span>
                        </span>
                      </span>
                      <span className="whitespace-nowrap text-sm font-medium text-aqua">
                        от {formatRub(s.basePrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">2. Дата и время</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="date"
            min={minDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
          />
          <input
            type="time"
            value={time}
            min="09:00"
            max="21:00"
            onChange={(e) => setTime(e.target.value)}
            className="h-12 rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-semibold">3. Автомобиль</h2>
        <p className="mb-3 text-xs text-mute">
          Выберите сохранённый автомобиль или добавьте новый
        </p>
        {cars.length > 0 && (
          <select
            value={carId}
            onChange={(e) => {
              setCarId(e.target.value);
              if (e.target.value) {
                setMake("");
                setModel("");
                setPlate("");
              }
            }}
            className="mb-3 h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
          >
            <option value="" className="bg-surface">Добавить новый автомобиль</option>
            {cars.map((car) => (
              <option key={car.id} value={car.id} className="bg-surface">
                {car.make} {car.model}
                {car.plate ? ` · ${car.plate}` : ""}
              </option>
            ))}
          </select>
        )}
        {!carId && (
        <div className="grid gap-3 sm:grid-cols-2">
          <CarCatalogFields
            make={make}
            model={model}
            plate={plate}
            setMake={setMake}
            setModel={setModel}
            setPlate={setPlate}
            className="contents"
          />
          <select
            value={bodyClass}
            onChange={(e) => setBodyClass(e.target.value)}
            className="h-12 rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
          >
            {Object.entries(BODY_CLASS_LABELS).map(([k, v]) => (
              <option key={k} value={k} className="bg-surface">
                {v}
              </option>
            ))}
          </select>
        </div>
        )}
        <textarea
          placeholder="Комментарий (пожелания, состояние авто)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="mt-3 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-foam outline-none focus:border-aqua/50"
        />
      </section>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
      )}

      <div className="sticky bottom-24 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-line bg-deep/95 p-4 backdrop-blur sm:bottom-4 sm:flex-row sm:items-center sm:gap-4">
        <div>
          <span className="text-xs text-mute">Предварительная стоимость</span>
          <div className="text-xl font-semibold text-aqua">{formatRub(total)}</div>
        </div>
        <Button type="submit" size="lg" disabled={busy} className="w-full sm:w-auto">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Отправить заявку
        </Button>
      </div>
    </form>
  );
}
