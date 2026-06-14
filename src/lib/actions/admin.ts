"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { normalizePhone } from "@/lib/phone";
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

export async function assignBookingWorker(bookingId: string, workerId: string) {
  await requireRole(["ADMIN"]);
  await prisma.booking.update({
    where: { id: bookingId },
    data: { workerId: workerId || null },
  });
  revalidatePath("/admin/bookings");
  revalidatePath("/worker");
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

export async function saveEmployee(input: {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  role: "WORKER" | "ADMIN";
  password?: string;
  note?: string;
}) {
  const admin = await requireRole(["ADMIN"]);
  const phone = normalizePhone(input.phone);
  if (!phone) return { ok: false, error: "Некорректный телефон" };
  if (!input.name.trim()) return { ok: false, error: "Укажите имя" };
  if (!input.id && (!input.password || input.password.length < 6)) {
    return { ok: false, error: "Пароль минимум 6 символов" };
  }

  const data = {
    name: input.name.trim(),
    phone,
    email: input.email?.trim() || null,
    role: input.role,
    note: input.note?.trim() || null,
    ...(input.password ? { passwordHash: hashPassword(input.password) } : {}),
  };

  if (input.id) {
    if (input.id === admin.id && input.role !== "ADMIN") {
      return { ok: false, error: "Нельзя снять права администратора с себя" };
    }
    await prisma.user.update({ where: { id: input.id }, data });
  } else {
    await prisma.user.create({ data });
  }

  revalidatePath("/admin/employees");
  revalidatePath("/admin/clients");
  return { ok: true };
}

export async function updateClientCard(input: {
  userId: string;
  name?: string;
  phone?: string;
  email?: string;
  note?: string;
  bonusDiscountPercent?: number;
}) {
  await requireRole(["ADMIN"]);
  const phone = input.phone ? normalizePhone(input.phone) : null;
  if (input.phone && !phone) return { ok: false, error: "Некорректный телефон" };

  await prisma.user.update({
    where: { id: input.userId },
    data: {
      name: input.name?.trim() || null,
      phone,
      email: input.email?.trim() || null,
      note: input.note?.trim() || null,
      bonusDiscountPercent: Math.max(
        0,
        Math.min(100, Number(input.bonusDiscountPercent) || 0),
      ),
    },
  });

  revalidatePath(`/admin/clients/${input.userId}`);
  revalidatePath("/admin/clients");
  return { ok: true };
}

export async function savePromotion(input: {
  id?: string;
  title: string;
  description?: string;
  discountPercent: number;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
}) {
  await requireRole(["ADMIN"]);
  if (!input.title.trim()) return { ok: false, error: "Укажите название акции" };
  const data = {
    title: input.title.trim(),
    description: input.description?.trim() || null,
    discountPercent: Math.max(0, Math.min(100, Number(input.discountPercent) || 0)),
    active: input.active,
    startsAt: input.startsAt ? new Date(input.startsAt) : null,
    endsAt: input.endsAt ? new Date(input.endsAt) : null,
  };
  if (input.id) {
    await prisma.promotion.update({ where: { id: input.id }, data });
  } else {
    await prisma.promotion.create({ data });
  }
  revalidatePath("/");
  revalidatePath("/admin/promotions");
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
