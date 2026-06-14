"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { normalizePhone } from "@/lib/phone";
import type { BodyClass } from "@prisma/client";

export async function updateProfile(input: { name?: string; phone?: string }) {
  const user = await requireUser();
  const phone = input.phone ? normalizePhone(input.phone) : user.phone;
  if (input.phone && !phone) return { ok: false, error: "Некорректный телефон" };
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: input.name?.trim() || user.name,
      phone,
    },
  });
  revalidatePath("/cabinet");
  revalidatePath("/cabinet/profile");
  return { ok: true };
}

export async function saveClientCar(input: {
  id?: string;
  make: string;
  model: string;
  plate?: string;
  color?: string;
  year?: number;
  bodyClass?: BodyClass;
}) {
  const user = await requireUser();
  if (!input.make.trim() || !input.model.trim()) {
    return { ok: false, error: "Укажите марку и модель" };
  }
  const data = {
    userId: user.id,
    make: input.make.trim(),
    model: input.model.trim(),
    plate: input.plate?.trim() || null,
    color: input.color?.trim() || null,
    year: input.year ? Number(input.year) : null,
    bodyClass: input.bodyClass ?? "B",
  };
  if (input.id) {
    await prisma.car.updateMany({
      where: { id: input.id, userId: user.id },
      data,
    });
  } else {
    await prisma.car.create({ data });
  }
  revalidatePath("/cabinet/profile");
  revalidatePath("/cabinet/book");
  return { ok: true };
}

export async function deleteClientCar(id: string) {
  const user = await requireUser();
  await prisma.car.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/cabinet/profile");
  revalidatePath("/cabinet/book");
  return { ok: true };
}
