"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/dashboard/ui";
import { addGalleryImage, deleteGalleryImage } from "@/lib/actions/admin";

type Img = { id: string; url: string; caption: string | null; category: string };

export function GalleryManager({ images }: { images: Img[] }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function add() {
    setError("");
    setBusy(true);
    try {
      const res = await addGalleryImage({ url, caption });
      if (!res.ok) setError(res.error ?? "Ошибка");
      else {
        setUrl("");
        setCaption("");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className="mb-3 text-lg font-semibold">Галерея работ</h2>
      <div className="flex flex-wrap gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Ссылка на изображение (https://...)"
          className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
        />
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Подпись"
          className="h-11 w-40 rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
        />
        <Button onClick={add} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Добавить
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative overflow-hidden rounded-xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.caption ?? "Работа"}
                className="h-32 w-full object-cover"
              />
              <button
                onClick={async () => {
                  await deleteGalleryImage(img.id);
                  router.refresh();
                }}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-abyss/80 text-mist opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-abyss/80 px-2 py-1 text-xs text-mist">
                  {img.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
