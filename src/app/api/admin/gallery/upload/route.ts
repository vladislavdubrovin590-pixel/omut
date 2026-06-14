import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 80 * 1024 * 1024;
const UPLOAD_DIR = process.env.GALLERY_UPLOAD_DIR ?? "/var/www/omut-uploads/gallery";
const PUBLIC_PREFIX = "/uploads/gallery";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

export async function POST(req: Request) {
  const user = await getApiUser(["ADMIN"]);
  if (!user) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const caption = String(formData.get("caption") ?? "").trim();
  const category = String(formData.get("category") ?? "work").trim() || "work";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Выберите фото или видео" }, { status: 400 });
  }

  const ext = EXT_BY_MIME[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Поддерживаются JPG, PNG, WEBP, GIF, MP4, WEBM, MOV" },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Файл слишком большой. Максимум 80 МБ" },
      { status: 400 },
    );
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const mediaType = file.type.startsWith("video/") ? "video" : "image";
  const filename = `${Date.now()}-${randomUUID()}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(filepath, bytes);

  const item = await prisma.galleryImage.create({
    data: {
      url: `${PUBLIC_PREFIX}/${filename}`,
      caption: caption || null,
      category,
      mediaType,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/content");

  return NextResponse.json({ ok: true, item });
}
