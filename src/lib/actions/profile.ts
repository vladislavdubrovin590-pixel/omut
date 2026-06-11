"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function updateProfile(input: { name?: string; phone?: string }) {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: input.name?.trim() || user.name,
      phone: input.phone?.trim() || user.phone,
    },
  });
  revalidatePath("/cabinet");
  revalidatePath("/cabinet/profile");
  return { ok: true };
}
