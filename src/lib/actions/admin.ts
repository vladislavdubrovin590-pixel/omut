"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import type { BookingStatus, Role } from "@prisma/client";

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
) {
  await requireRole(["ADMIN"]);
  await prisma.booking.update({ where: { id: bookingId }, data: { status } });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { ok: true };
}

export async function saveContent(entries: Record<string, string>) {
  await requireRole(["ADMIN"]);
  await Promise.all(
    Object.entries(entries).map(([key, value]) =>
      prisma.contentBlock.upsert({
        where: { key },
        create: { key, value, type: "text" },
        update: { value },
      }),
    ),
  );
  revalidatePath("/");
  revalidatePath("/admin/content");
  return { ok: true };
}

export type ServiceInput = {
  id?: string;
  slug: string;
  title: string;
  shortDesc?: string;
  category: string;
  basePrice: number;
  durationMin: number;
  active: boolean;
  popular: boolean;
  sortOrder: number;
};

export async function saveService(input: ServiceInput) {
  await requireRole(["ADMIN"]);
  const data = {
    slug: input.slug.trim(),
    title: input.title.trim(),
    shortDesc: input.shortDesc?.trim() || null,
    category: input.category,
    basePrice: Number(input.basePrice) || 0,
    durationMin: Number(input.durationMin) || 60,
    active: input.active,
    popular: input.popular,
    sortOrder: Number(input.sortOrder) || 0,
  };
  if (input.id) {
    await prisma.service.update({ where: { id: input.id }, data });
  } else {
    await prisma.service.create({ data });
  }
  revalidatePath("/");
  revalidatePath("/admin/services");
  return { ok: true };
}

export async function deleteService(id: string) {
  await requireRole(["ADMIN"]);
  try {
    await prisma.service.delete({ where: { id } });
  } catch {
    // referenced by bookings/visits — soft-disable instead
    await prisma.service.update({ where: { id }, data: { active: false } });
  }
  revalidatePath("/");
  revalidatePath("/admin/services");
  return { ok: true };
}

export async function setReviewApproval(id: string, approved: boolean) {
  await requireRole(["ADMIN"]);
  await prisma.review.update({ where: { id }, data: { approved } });
  revalidatePath("/");
  revalidatePath("/admin/reviews");
  return { ok: true };
}

export async function deleteReview(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  return { ok: true };
}

export async function setUserRole(userId: string, role: Role) {
  const admin = await requireRole(["ADMIN"]);
  if (userId === admin.id) return { ok: false, error: "Нельзя изменить свою роль" };
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/clients");
  return { ok: true };
}

export async function addGalleryImage(input: {
  url: string;
  caption?: string;
  category?: string;
}) {
  await requireRole(["ADMIN"]);
  if (!input.url.trim()) return { ok: false, error: "Укажите ссылку на изображение" };
  await prisma.galleryImage.create({
    data: {
      url: input.url.trim(),
      caption: input.caption?.trim() || null,
      category: input.category || "work",
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/content");
  return { ok: true };
}

export async function deleteGalleryImage(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.galleryImage.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/content");
  return { ok: true };
}
