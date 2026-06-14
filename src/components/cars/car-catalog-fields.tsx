"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { CAR_CATALOG, CAR_MAKES } from "@/lib/car-catalog";
import { cn } from "@/lib/utils";

function filterOptions(options: string[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  return options.filter((item) => item.toLowerCase().includes(q));
}

function CatalogCombobox({
  label,
  value,
  options,
  placeholder,
  disabled,
  emptyText,
  onSelect,
}: {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  emptyText: string;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => filterOptions(options, query || value), [options, query, value]);

  return (
    <label className="relative space-y-1 text-sm">
      <span className="text-mute">{label}</span>
      <div
        className={cn(
          "flex h-12 items-center gap-2 rounded-xl border border-line bg-surface px-3 focus-within:border-aqua/50",
          disabled && "opacity-60",
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-mute" />
        <input
          type="text"
          value={open ? query : value}
          disabled={disabled}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-foam outline-none placeholder:text-mute"
        />
        <ChevronDown className="h-4 w-4 shrink-0 text-mute" />
      </div>

      {open && !disabled && (
        <div className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-line bg-deep p-1 shadow-2xl">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-mute">{emptyText}</div>
          ) : (
            filtered.map((item) => (
              <button
                key={item}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(item);
                  setQuery("");
                  setOpen(false);
                }}
                className={cn(
                  "block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-aqua/10",
                  item === value ? "text-aqua" : "text-foam",
                )}
              >
                {item}
              </button>
            ))
          )}
        </div>
      )}
    </label>
  );
}

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
      <CatalogCombobox
        label="Марка"
        value={make}
        options={CAR_MAKES}
        placeholder="Начните вводить марку"
        emptyText="Марка не найдена"
        onSelect={(value) => {
          setMake(value);
          setModel("");
        }}
      />

      <CatalogCombobox
        label="Модель"
        value={model}
        options={models}
        disabled={!make}
        placeholder={make ? "Выберите модель" : "Сначала выберите марку"}
        emptyText="Для этой марки модель не найдена"
        onSelect={setModel}
      />

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
