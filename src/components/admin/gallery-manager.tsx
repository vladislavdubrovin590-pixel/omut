"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, LinkIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { AlertModal } from "@/components/ui/alert-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/dashboard/ui";
import { addGalleryImage, deleteGalleryImage } from "@/lib/actions/admin";

type Img = {
  id: string;
  url: string;
  caption: string | null;
  category: string;
  mediaType: string;
};

export function GalleryManager({ images }: { images: Img[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [fileCaption, setFileCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function uploadFile() {
    setError("");
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Выберите файл с компьютера");
      return;
    }
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", fileCaption);
      const res = await fetch("/api/admin/gallery/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось загрузить файл");
        return;
      }
      if (fileRef.current) fileRef.current.value = "";
      setFileCaption("");
      router.refresh();
    } catch {
      setError("Ошибка загрузки файла");
    } finally {
      setBusy(false);
    }
  }

  async function add() {
    setError("");
    setBusy(true);
    try {
      const mediaType = /\.(mp4|webm|mov)$/i.test(url) ? "video" : "image";
      const res = await addGalleryImage({ url, caption, mediaType });
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
      <AlertModal
        title="Галерея не обновлена"
        message={error}
        onClose={() => setError("")}
      />

      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <ImagePlus className="h-5 w-5 text-aqua" />
        Галерея работ
      </h2>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white/[0.02] p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-foam">
            <Upload className="h-4 w-4 text-aqua" />
            Загрузить с компьютера
          </p>
          <div className="grid gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              className="block w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-mist file:mr-3 file:rounded-full file:border-0 file:bg-aqua file:px-4 file:py-2 file:text-sm file:font-semibold file:text-abyss"
            />
            <input
              value={fileCaption}
              onChange={(e) => setFileCaption(e.target.value)}
              placeholder="Подпись к фото/видео"
              className="h-11 rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
            />
            <Button type="button" onClick={uploadFile} disabled={busy} className="w-full sm:w-fit">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Загрузить файл
            </Button>
            <p className="text-xs text-mute">Фото: JPG, PNG, WEBP, GIF. Видео: MP4, WEBM, MOV. До 80 МБ.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white/[0.02] p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-foam">
            <LinkIcon className="h-4 w-4 text-aqua" />
            Добавить по ссылке
          </p>
          <div className="grid gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Ссылка на фото или видео"
              className="h-11 rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
            />
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Подпись"
              className="h-11 rounded-xl border border-line bg-surface px-4 text-sm text-foam outline-none focus:border-aqua/50"
            />
            <Button type="button" onClick={add} disabled={busy} variant="subtle" className="w-full sm:w-fit">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Добавить ссылку
            </Button>
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative overflow-hidden rounded-xl border border-line">
              {img.mediaType === "video" ? (
                <video src={img.url} className="h-32 w-full object-cover" muted playsInline controls />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.url}
                  alt={img.caption ?? "Работа"}
                  className="h-32 w-full object-cover"
                />
              )}
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
