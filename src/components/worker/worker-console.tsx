"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserPlus,
  CarFront,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, StatusBadge } from "@/components/dashboard/ui";
import {
  confirmArrival,
  createOrFindClient,
  saveVisit,
  searchClients,
  type VisitItemInput,
} from "@/lib/actions/worker";
import { formatRub, formatDate, BODY_CLASS_LABELS, BOOKING_STATUS_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";

type BookingDTO = {
  id: string;
  scheduledAt: string;
  status: string;
  clientId: string;
  clientName: string;
  carLabel: string | null;
  services: { title: string; price: number }[];
  estimatedTotal: number;
  note: string | null;
};

type ServiceDTO = { id: string; title: string; basePrice: number };

type ClientResult = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
};

type Item = VisitItemInput & { key: string };

export function WorkerConsole({
  bookings,
  services,
}: {
  bookings: BookingDTO[];
  services: ServiceDTO[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"today" | "new">("today");

  // visit form state
  const [client, setClient] = useState<{ id: string; name: string } | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [bodyClass, setBodyClass] = useState("B");
  const [note, setNote] = useState("");
  const [overrideTotal, setOverrideTotal] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const computedTotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.qty, 0),
    [items],
  );
  const total = overrideTotal !== "" ? Number(overrideTotal) || 0 : computedTotal;

  function startVisitFromBooking(b: BookingDTO) {
    setClient({ id: b.clientId, name: b.clientName });
    setBookingId(b.id);
    setItems(
      b.services.map((s, idx) => ({
        key: `b${idx}`,
        title: s.title,
        price: s.price,
        qty: 1,
      })),
    );
    if (b.carLabel) {
      const [mk, ...rest] = b.carLabel.split(" ");
      setMake(mk ?? "");
      setModel(rest.join(" "));
    }
    setOverrideTotal("");
    setNote("");
    setError("");
    setOk(false);
    setTab("new");
  }

  function resetForm() {
    setClient(null);
    setBookingId(null);
    setItems([]);
    setMake("");
    setModel("");
    setPlate("");
    setBodyClass("B");
    setNote("");
    setOverrideTotal("");
    setError("");
  }

  function addService(id: string) {
    const svc = services.find((s) => s.id === id);
    if (!svc) return;
    setItems((prev) => [
      ...prev,
      { key: `s${Date.now()}`, serviceId: svc.id, title: svc.title, price: svc.basePrice, qty: 1 },
    ]);
  }

  function addCustom() {
    setItems((prev) => [
      ...prev,
      { key: `c${Date.now()}`, title: "", price: 0, qty: 1 },
    ]);
  }

  function updateItem(key: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  async function handleSave() {
    setError("");
    if (!client) return setError("Выберите клиента");
    const valid = items.filter((i) => i.title.trim());
    if (valid.length === 0) return setError("Добавьте хотя бы одну услугу");
    setBusy(true);
    try {
      const res = await saveVisit({
        clientUserId: client.id,
        bookingId: bookingId || undefined,
        car: make && model ? { make, model, plate, bodyClass: bodyClass as never } : undefined,
        items: valid.map(({ serviceId, title, price, qty }) => ({
          serviceId,
          title: title.trim(),
          price: Number(price) || 0,
          qty: Number(qty) || 1,
        })),
        totalAmount: total,
        note: note || undefined,
      });
      if (!res.ok) {
        setError(res.error ?? "Не удалось сохранить визит");
      } else {
        setOk(true);
        resetForm();
        router.refresh();
        setTimeout(() => setOk(false), 3000);
      }
    } catch {
      setError("Ошибка сохранения. Проверьте доступ.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6 inline-flex rounded-full border border-line p-1 text-sm">
        <button
          onClick={() => setTab("today")}
          className={cn(
            "rounded-full px-5 py-2 transition-colors",
            tab === "today" ? "bg-aqua text-abyss font-medium" : "text-mist",
          )}
        >
          Записи сегодня
        </button>
        <button
          onClick={() => setTab("new")}
          className={cn(
            "rounded-full px-5 py-2 transition-colors",
            tab === "new" ? "bg-aqua text-abyss font-medium" : "text-mist",
          )}
        >
          Оформить визит
        </button>
      </div>

      {ok && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-teal/30 bg-teal/10 px-4 py-2 text-sm text-teal">
          <Check className="h-4 w-4" /> Визит сохранён, клиент уведомлён
        </div>
      )}

      {tab === "today" ? (
        <TodayList bookings={bookings} onStartVisit={startVisitFromBooking} />
      ) : (
        <VisitForm
          client={client}
          setClient={setClient}
          items={items}
          services={services}
          addService={addService}
          addCustom={addCustom}
          updateItem={updateItem}
          removeItem={removeItem}
          make={make}
          setMake={setMake}
          model={model}
          setModel={setModel}
          plate={plate}
          setPlate={setPlate}
          bodyClass={bodyClass}
          setBodyClass={setBodyClass}
          note={note}
          setNote={setNote}
          computedTotal={computedTotal}
          overrideTotal={overrideTotal}
          setOverrideTotal={setOverrideTotal}
          total={total}
          error={error}
          busy={busy}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function TodayList({
  bookings,
  onStartVisit,
}: {
  bookings: BookingDTO[];
  onStartVisit: (b: BookingDTO) => void;
}) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        title="На сегодня записей нет"
        hint="Можно оформить визит вручную во вкладке «Оформить визит»"
        icon={<ClipboardCheck className="h-8 w-8" />}
      />
    );
  }
  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <Card key={b.id} className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium text-foam">{formatDate(b.scheduledAt, true)}</span>
              <StatusBadge status={b.status} label={BOOKING_STATUS_LABELS[b.status]} />
            </div>
            <p className="mt-1 text-sm text-foam">{b.clientName}</p>
            <p className="mt-0.5 text-sm text-mist">
              {b.services.map((s) => s.title).join(", ")}
            </p>
            {b.carLabel && <p className="mt-0.5 text-xs text-mute">{b.carLabel}</p>}
            {b.note && <p className="mt-1 text-xs text-mute">«{b.note}»</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="font-semibold text-aqua">{formatRub(b.estimatedTotal)}</div>
            <div className="flex gap-2">
              {b.status !== "IN_PROGRESS" && <ArrivalButton bookingId={b.id} />}
              <Button size="sm" onClick={() => onStartVisit(b)}>
                Оформить
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ArrivalButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await confirmArrival(bookingId);
          router.refresh();
        })
      }
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      Приехал
    </Button>
  );
}

type VisitFormProps = {
  client: { id: string; name: string } | null;
  setClient: (c: { id: string; name: string } | null) => void;
  items: Item[];
  services: ServiceDTO[];
  addService: (id: string) => void;
  addCustom: () => void;
  updateItem: (key: string, patch: Partial<Item>) => void;
  removeItem: (key: string) => void;
  make: string;
  setMake: (v: string) => void;
  model: string;
  setModel: (v: string) => void;
  plate: string;
  setPlate: (v: string) => void;
  bodyClass: string;
  setBodyClass: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  computedTotal: number;
  overrideTotal: string;
  setOverrideTotal: (v: string) => void;
  total: number;
  error: string;
  busy: boolean;
  onSave: () => void;
};

function VisitForm(p: VisitFormProps) {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Клиент</h2>
        {p.client ? (
          <div className="flex items-center justify-between rounded-xl border border-aqua/40 bg-aqua/10 px-4 py-3">
            <span className="text-foam">{p.client.name}</span>
            <button
              onClick={() => p.setClient(null)}
              className="text-xs text-mist hover:text-foam"
            >
              Сменить
            </button>
          </div>
        ) : (
          <ClientPicker onPick={(c) => p.setClient({ id: c.id, name: c.name || c.phone || "Клиент" })} />
        )}
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Выполненные услуги</h2>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <select
            onChange={(e) => {
              if (e.target.value) {
                p.addService(e.target.value);
                e.target.value = "";
              }
            }}
            defaultValue=""
            className="h-10 rounded-xl border border-line bg-surface px-3 text-sm text-foam outline-none focus:border-aqua/50"
          >
            <option value="" className="bg-surface">
              + Добавить услугу из каталога
            </option>
            {p.services.map((s) => (
              <option key={s.id} value={s.id} className="bg-surface">
                {s.title} — {formatRub(s.basePrice)}
              </option>
            ))}
          </select>
          <Button size="sm" variant="subtle" onClick={p.addCustom}>
            <Plus className="h-4 w-4" /> Своя позиция
          </Button>
        </div>

        {p.items.length === 0 ? (
          <p className="py-4 text-center text-sm text-mute">Услуги не добавлены</p>
        ) : (
          <div className="space-y-2">
            {p.items.map((it) => (
              <div
                key={it.key}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface/60 p-2"
              >
                <input
                  value={it.title}
                  onChange={(e) => p.updateItem(it.key, { title: e.target.value })}
                  placeholder="Название услуги"
                  className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-sm text-foam outline-none focus:border-aqua/50"
                />
                <input
                  type="number"
                  value={it.qty}
                  min={1}
                  onChange={(e) => p.updateItem(it.key, { qty: Number(e.target.value) })}
                  className="h-9 w-16 rounded-lg border border-line bg-surface px-2 text-sm text-foam outline-none focus:border-aqua/50"
                  title="Количество"
                />
                <input
                  type="number"
                  value={it.price}
                  min={0}
                  onChange={(e) => p.updateItem(it.key, { price: Number(e.target.value) })}
                  className="h-9 w-28 rounded-lg border border-line bg-surface px-2 text-sm text-foam outline-none focus:border-aqua/50"
                  title="Цена, ₽"
                />
                <button
                  onClick={() => p.removeItem(it.key)}
                  className="grid h-9 w-9 place-items-center rounded-lg text-mute hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <CarFront className="h-5 w-5 text-aqua" /> Автомобиль
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Марка"
            value={p.make}
            onChange={(e) => p.setMake(e.target.value)}
            className="h-11 rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
          />
          <input
            placeholder="Модель"
            value={p.model}
            onChange={(e) => p.setModel(e.target.value)}
            className="h-11 rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
          />
          <input
            placeholder="Госномер"
            value={p.plate}
            onChange={(e) => p.setPlate(e.target.value)}
            className="h-11 rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
          />
          <select
            value={p.bodyClass}
            onChange={(e) => p.setBodyClass(e.target.value)}
            className="h-11 rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
          >
            {Object.entries(BODY_CLASS_LABELS).map(([k, v]) => (
              <option key={k} value={k} className="bg-surface">
                {v}
              </option>
            ))}
          </select>
        </div>
        <textarea
          placeholder="Комментарий к визиту"
          value={p.note}
          onChange={(e) => p.setNote(e.target.value)}
          rows={2}
          className="mt-3 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-foam outline-none focus:border-aqua/50"
        />
      </Card>

      {p.error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{p.error}</p>
      )}

      <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-deep/90 p-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-xs text-mute">Итоговая сумма</span>
            <div className="text-xl font-semibold text-aqua">{formatRub(p.total)}</div>
          </div>
          <input
            type="number"
            value={p.overrideTotal}
            onChange={(e) => p.setOverrideTotal(e.target.value)}
            placeholder={`Изм. (${p.computedTotal})`}
            className="h-10 w-32 rounded-lg border border-line bg-surface px-3 text-sm text-foam outline-none focus:border-aqua/50"
            title="Переопределить итог"
          />
        </div>
        <Button size="lg" onClick={p.onSave} disabled={p.busy}>
          {p.busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Сохранить визит
        </Button>
      </div>
    </div>
  );
}

function ClientPicker({ onPick }: { onPick: (c: ClientResult) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ClientResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [creating, setCreating] = useState(false);

  async function doSearch(value: string) {
    setQ(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await searchClients(value);
      setResults(res as ClientResult[]);
    } finally {
      setSearching(false);
    }
  }

  async function create() {
    if (!newPhone.trim() && !newName.trim()) return;
    setCreating(true);
    try {
      const user = await createOrFindClient({ name: newName, phone: newPhone });
      onPick(user as ClientResult);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 focus-within:border-aqua/50">
          <Search className="h-4 w-4 text-mute" />
          <input
            value={q}
            onChange={(e) => doSearch(e.target.value)}
            placeholder="Поиск по имени, телефону или email"
            className="h-11 w-full bg-transparent text-sm text-foam outline-none placeholder:text-mute"
          />
          {searching && <Loader2 className="h-4 w-4 animate-spin text-mute" />}
        </div>
        {results.length > 0 && (
          <div className="mt-2 space-y-1">
            {results.map((c) => (
              <button
                key={c.id}
                onClick={() => onPick(c)}
                className="flex w-full items-center justify-between rounded-lg border border-line bg-surface/60 px-4 py-2.5 text-left text-sm hover:border-aqua/40"
              >
                <span className="text-foam">{c.name || "Без имени"}</span>
                <span className="text-xs text-mute">{c.phone || c.email}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-dashed border-line p-4">
        <p className="mb-2 flex items-center gap-2 text-sm text-mist">
          <UserPlus className="h-4 w-4" /> Новый клиент
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Имя"
            className="h-10 rounded-lg border border-line bg-surface px-3 text-sm text-foam outline-none focus:border-aqua/50"
          />
          <input
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Телефон"
            className="h-10 rounded-lg border border-line bg-surface px-3 text-sm text-foam outline-none focus:border-aqua/50"
          />
        </div>
        <Button size="sm" variant="subtle" className="mt-2" onClick={create} disabled={creating}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Добавить и выбрать
        </Button>
      </div>
    </div>
  );
}
