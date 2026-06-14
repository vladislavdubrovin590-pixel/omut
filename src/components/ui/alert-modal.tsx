"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AlertModal({
  title = "Нужно исправить",
  message,
  onClose,
}: {
  title?: string;
  message: string;
  onClose: () => void;
}) {
  if (!message) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-red-400/30 bg-deep p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-red-500/15 text-red-300">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h2 id="alert-modal-title" className="text-lg font-semibold text-foam">
                {title}
              </h2>
              <p className="mt-1 text-sm text-mist">{message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-mute hover:bg-white/5 hover:text-foam"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <Button type="button" className="mt-5 w-full" onClick={onClose}>
          Понятно
        </Button>
      </div>
    </div>
  );
}
