"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { requireRole } from "@/lib/session";
import { sendPushToUser } from "@/lib/actions/push";
import type { BodyClass } from "@prisma/client";

export async function searchClients(q: string) {
  await requireRole(["WORKER", "ADMIN"]);
  const query = q.trim();
  if (query.length < 2) return [];
  return prisma.user.findMany({
    where: {
      role: "CLIENT",
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { phone: { contains: query } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    include: { cars: true },
    take: 10,
  });
}

export async function createOrFindClient(input: {
  name: string;
  phone: string;
}) {
  await requireRole(["WORKER", "ADMIN"]);
  const phone = input.phone.trim() ? normalizePhone(input.phone) : null;
  if (input.phone.trim() && !phone) return { ok: false, error: "Некорректный телефон" };
  let user = phone
    ? await prisma.user.findFirst({ where: { phone, role: "CLIENT" } })
    : null;
  if (!user) {
    user = await prisma.user.create({
      data: { name: input.name.trim() || "Клиент", phone, role: "CLIENT" },
    });
  }
  return user;
}

export async function confirmArrival(bookingId: string) {
  const worker = await requireRole(["WORKER", "ADMIN"]);
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "IN_PROGRESS", workerId: worker.id },
  });
  revalidatePath("/worker");
  return { ok: true };
}

export type VisitItemInput = {
  serviceId?: string;
  title: string;
  price: number;
  qty: number;
};

export async function saveVisit(input: {
  clientUserId: string;
  bookingId?: string;
  car?: { make: string; model: string; plate?: string; bodyClass?: BodyClass };
  items: VisitItemInput[];
  totalAmount: number;
  note?: string;
}) {
  const worker = await requireRole(["WORKER", "ADMIN"]);

  if (!input.clientUserId) return { ok: false, error: "Не выбран клиент" };
  if (!input.items?.length) return { ok: false, error: "Добавьте хотя бы одну услугу" };
  if (input.items.some((i) => !i.serviceId)) {
    return { ok: false, error: "Все позиции должны быть выбраны из единого прайса" };
  }

  let carId: string | undefined;
  if (input.car?.make && input.car?.model) {
    const car = await prisma.car.create({
      data: {
        userId: input.clientUserId,
        make: input.car.make,
        model: input.car.model,
        plate: input.car.plate || null,
        bodyClass: input.car.bodyClass ?? "B",
      },
    });
    carId = car.id;
  }

  const visit = await prisma.visit.create({
    data: {
      userId: input.clientUserId,
      workerId: worker.id,
      bookingId: input.bookingId || null,
      carId: carId || null,
      status: "COMPLETED",
      completedAt: new Date(),
      totalAmount: input.totalAmount,
      note: input.note || null,
      items: {
        create: input.items.map((i) => ({
          serviceId: i.serviceId || null,
          title: i.title,
          price: i.price,
          qty: i.qty,
        })),
      },
    },
  });

  if (input.bookingId) {
    await prisma.booking.update({
      where: { id: input.bookingId },
      data: { status: "COMPLETED", workerId: worker.id },
    });
  }

  // Notify the client that their visit is recorded.
  await sendPushToUser(input.clientUserId, {
    title: "Услуги выполнены",
    body: `Готово! Сумма: ${input.totalAmount.toLocaleString("ru-RU")} ₽. Детали — в личном кабинете.`,
    url: "/cabinet",
  }).catch(() => {});

  revalidatePath("/worker");
  revalidatePath("/cabinet");
  revalidatePath("/admin");
  return { ok: true, visitId: visit.id };
}
