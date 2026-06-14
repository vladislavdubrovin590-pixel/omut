"use server";

import { unlink } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { normalizePhone } from "@/lib/phone";
import { requireRole } from "@/lib/session";
import { applyPercentDiscount } from "@/lib/utils";
import type { BookingStatus, EmployeeStatus, Role } from "@prisma/client";

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
];

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
  if (workerId) {
    const worker = await prisma.user.findFirst({
      where: {
        id: workerId,
        role: { in: ["WORKER", "ADMIN"] },
        employeeStatus: "ACTIVE",
      },
      select: { id: true },
    });
    if (!worker) return { ok: false, error: "Сотрудник уволен или не найден" };
  }
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
    await syncServicePriceUsage(input.id, data.basePrice);
  } else {
    await prisma.service.create({ data });
  }
  revalidatePath("/");
  revalidatePath("/admin/services");
  revalidatePath("/admin/bookings");
  revalidatePath("/worker");
  revalidatePath("/cabinet");
  revalidatePath("/cabinet/bookings");
  return { ok: true };
}

async function syncServicePriceUsage(serviceId: string, basePrice: number) {
  const affectedBookings = await prisma.booking.findMany({
    where: {
      status: { in: ACTIVE_BOOKING_STATUSES },
      services: { some: { serviceId } },
    },
    select: { id: true, user: { select: { bonusDiscountPercent: true } } },
  });

  const bookingIds = affectedBookings.map((booking) => booking.id);

  if (bookingIds.length === 0) return;

  await Promise.all(
    affectedBookings.map((booking) =>
      prisma.bookingService.updateMany({
        where: { bookingId: booking.id, serviceId },
        data: { price: applyPercentDiscount(basePrice, booking.user.bonusDiscountPercent) },
      }),
    ),
  );

  await syncActiveBookingTotals(bookingIds);
}

async function syncClientDiscountUsage(userId: string) {
  const affectedBookings = await prisma.booking.findMany({
    where: {
      userId,
      status: { in: ACTIVE_BOOKING_STATUSES },
    },
    select: { id: true },
  });

  const bookingIds = affectedBookings.map((booking) => booking.id);
  if (bookingIds.length === 0) return;
  await syncActiveBookingTotals(bookingIds);
}

async function syncActiveBookingTotals(bookingIds: string[]) {
  const bookings = await prisma.booking.findMany({
    where: { id: { in: bookingIds }, status: { in: ACTIVE_BOOKING_STATUSES } },
    include: {
      user: { select: { bonusDiscountPercent: true } },
      services: { include: { service: true } },
    },
  });

  await Promise.all(
    bookings.map((booking) =>
      prisma.$transaction([
        ...booking.services.map((item) =>
          prisma.bookingService.update({
            where: { id: item.id },
            data: {
              price: applyPercentDiscount(
                item.service.basePrice,
                booking.user.bonusDiscountPercent,
              ),
            },
          }),
        ),
        prisma.booking.update({
          where: { id: booking.id },
          data: {
            estimatedTotal: booking.services.reduce(
              (sum, item) =>
                sum + applyPercentDiscount(
                  item.service.basePrice,
                  booking.user.bonusDiscountPercent,
                ),
              0,
            ),
          },
        }),
      ]),
    ),
  );
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
  employeeStatus?: EmployeeStatus;
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
    employeeStatus: input.employeeStatus ?? "ACTIVE",
    note: input.note?.trim() || null,
    ...(input.password ? { passwordHash: hashPassword(input.password) } : {}),
  };

  if (input.id) {
    if (input.id === admin.id && input.role !== "ADMIN") {
      return { ok: false, error: "Нельзя снять права администратора с себя" };
    }
    if (input.id === admin.id && input.employeeStatus === "DISMISSED") {
      return { ok: false, error: "Нельзя уволить текущего администратора" };
    }
    await prisma.user.update({ where: { id: input.id }, data });
  } else {
    await prisma.user.create({ data });
  }

  revalidatePath("/admin/employees");
  if (input.id) revalidatePath(`/admin/employees/${input.id}`);
  revalidatePath("/admin/clients");
  revalidatePath("/admin/bookings");
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
  await syncClientDiscountUsage(input.userId);

  revalidatePath(`/admin/clients/${input.userId}`);
  revalidatePath("/admin/clients");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/employees");
  revalidatePath("/worker");
  revalidatePath("/cabinet");
  revalidatePath("/cabinet/bookings");
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
  mediaType?: string;
}) {
  await requireRole(["ADMIN"]);
  if (!input.url.trim()) return { ok: false, error: "Укажите ссылку на изображение" };
  await prisma.galleryImage.create({
    data: {
      url: input.url.trim(),
      caption: input.caption?.trim() || null,
      category: input.category || "work",
      mediaType: input.mediaType || "image",
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/content");
  return { ok: true };
}

export async function deleteGalleryImage(id: string) {
  await requireRole(["ADMIN"]);
  const item = await prisma.galleryImage.delete({ where: { id } });
  if (item.url.startsWith("/uploads/gallery/")) {
    const filename = path.basename(item.url);
    const uploadDir = process.env.GALLERY_UPLOAD_DIR ?? "/var/www/omut-uploads/gallery";
    await unlink(path.join(uploadDir, filename)).catch(() => undefined);
  }
  revalidatePath("/");
  revalidatePath("/admin/content");
  return { ok: true };
}
