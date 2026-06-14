"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { applyPercentDiscount } from "@/lib/utils";
import type { BodyClass } from "@prisma/client";

export type CreateBookingInput = {
  serviceIds: string[];
  scheduledAt: string; // ISO
  note?: string;
  car?: {
    make: string;
    model: string;
    plate?: string;
    bodyClass?: BodyClass;
  };
  carId?: string;
};

export async function createBooking(input: CreateBookingInput) {
  const user = await requireUser();

  if (!input.serviceIds?.length) {
    return { ok: false, error: "Выберите хотя бы одну услугу" };
  }
  if (!input.scheduledAt) {
    return { ok: false, error: "Укажите дату и время" };
  }

  const services = await prisma.service.findMany({
    where: { id: { in: input.serviceIds }, active: true },
  });
  if (services.length === 0) {
    return { ok: false, error: "Услуги не найдены" };
  }

  let carId: string | undefined = undefined;
  if (input.carId) {
    const existing = await prisma.car.findFirst({
      where: { id: input.carId, userId: user.id },
      select: { id: true },
    });
    carId = existing?.id;
  }
  if (!carId && input.car?.make && input.car?.model) {
    const car = await prisma.car.create({
      data: {
        userId: user.id,
        make: input.car.make,
        model: input.car.model,
        plate: input.car.plate || null,
        bodyClass: input.car.bodyClass ?? "B",
      },
    });
    carId = car.id;
  }

  const discountPercent = user.bonusDiscountPercent;
  const estimatedTotal = services.reduce(
    (sum, s) => sum + applyPercentDiscount(s.basePrice, discountPercent),
    0,
  );

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      carId,
      scheduledAt: new Date(input.scheduledAt),
      note: input.note || null,
      estimatedTotal,
      status: "PENDING",
      services: {
        create: services.map((s) => ({
          serviceId: s.id,
          price: applyPercentDiscount(s.basePrice, discountPercent),
        })),
      },
    },
  });

  revalidatePath("/cabinet");
  revalidatePath("/admin/bookings");
  return { ok: true, bookingId: booking.id };
}

export async function cancelBooking(bookingId: string) {
  const user = await requireUser();
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== user.id) {
    return { ok: false, error: "Запись не найдена" };
  }
  if (["COMPLETED", "IN_PROGRESS"].includes(booking.status)) {
    return { ok: false, error: "Эту запись уже нельзя отменить" };
  }
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/cabinet");
  return { ok: true };
}
