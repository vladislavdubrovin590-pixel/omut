"use client";

import { CAR_CATALOG, CAR_MAKES } from "@/lib/car-catalog";

export function CarCatalogFields({
  make,
  model,
  plate,
  setMake,
  setModel,
  setPlate,
  className = "",
}: {
  make: string;
  model: string;
  plate?: string;
  setMake: (value: string) => void;
  setModel: (value: string) => void;
  setPlate?: (value: string) => void;
  className?: string;
}) {
  const models = CAR_CATALOG[make] ?? [];

  return (
    <div className={className || "grid gap-3 sm:grid-cols-2"}>
      <label className="space-y-1 text-sm">
        <span className="text-mute">Марка</span>
        <input
          list="car-makes"
          value={make}
          onChange={(e) => {
            setMake(e.target.value);
            setModel("");
          }}
          placeholder="Toyota"
          className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
        />
        <datalist id="car-makes">
          {CAR_MAKES.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-mute">Модель</span>
        <input
          list="car-models"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={models[0] ?? "Camry"}
          className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
        />
        <datalist id="car-models">
          {models.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      </label>

      {setPlate && (
        <label className="space-y-1 text-sm">
          <span className="text-mute">Госномер</span>
          <input
            value={plate ?? ""}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder="А123АА163"
            className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
          />
        </label>
      )}
    </div>
  );
}
