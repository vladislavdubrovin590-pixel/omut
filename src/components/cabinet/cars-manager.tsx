"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { BodyClass } from "@prisma/client";
import { CarCatalogFields } from "@/components/cars/car-catalog-fields";
import { Button } from "@/components/ui/button";
import { saveClientCar, deleteClientCar } from "@/lib/actions/profile";
import { BODY_CLASS_LABELS } from "@/lib/utils";

type CarRow = {
  id: string;
  make: string;
  model: string;
  plate: string | null;
  color: string | null;
  year: number | null;
  bodyClass: BodyClass;
};

export function CarsManager({ cars }: { cars: CarRow[] }) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [bodyClass, setBodyClass] = useState<BodyClass>("B");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function save() {
    setMessage("");
    startTransition(async () => {
      const result = await saveClientCar({ make, model, plate, bodyClass });
      if (result.ok) {
        setMake("");
        setModel("");
        setPlate("");
        setBodyClass("B");
        setMessage("Автомобиль добавлен");
      } else {
        setMessage(result.error ?? "Не удалось сохранить");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line bg-white/[0.02] p-3">
        <CarCatalogFields
          make={make}
          model={model}
          plate={plate}
          setMake={setMake}
          setModel={setModel}
          setPlate={setPlate}
        />
        <select
          value={bodyClass}
          onChange={(e) => setBodyClass(e.target.value as BodyClass)}
          className="mt-3 h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
        >
          {Object.entries(BODY_CLASS_LABELS).map(([key, label]) => (
            <option key={key} value={key} className="bg-surface">
              {label}
            </option>
          ))}
        </select>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="button" size="sm" onClick={save} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Добавить автомобиль
          </Button>
          {message && <span className="text-sm text-mist">{message}</span>}
        </div>
      </div>

      <div className="space-y-2">
        {cars.map((car) => (
          <div
            key={car.id}
            className="flex flex-col gap-3 rounded-xl border border-line bg-surface/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="text-sm text-foam">
                {car.make} {car.model}
              </div>
              <div className="text-xs text-mute">
                {BODY_CLASS_LABELS[car.bodyClass]}
                {car.plate ? ` · ${car.plate}` : ""}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                startTransition(async () => {
                  await deleteClientCar(car.id);
                })
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-3 py-2 text-xs text-mist hover:border-red-400/50 hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
