"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/session";
import { adminMessaging } from "@/lib/firebase/admin";
import type { PushAudience } from "@prisma/client";

type Payload = { title: string; body: string; url?: string };

async function deliver(tokens: string[], payload: Payload) {
  if (tokens.length === 0) return { sent: 0, failed: 0, invalid: [] as string[] };

  const res = await adminMessaging.sendEachForMulticast({
    tokens,
    webpush: {
      notification: {
        title: payload.title,
        body: payload.body,
        icon: "/icon-192.png",
      },
      fcmOptions: { link: payload.url ?? "/cabinet" },
    },
  });

  const invalid: string[] = [];
  res.responses.forEach((r, i) => {
    if (!r.success) {
      const code = r.error?.code ?? "";
      if (
        code.includes("registration-token-not-registered") ||
        code.includes("invalid-argument")
      ) {
        invalid.push(tokens[i]);
      }
    }
  });

  if (invalid.length) {
    await prisma.pushToken
      .deleteMany({ where: { token: { in: invalid } } })
      .catch(() => {});
  }

  return { sent: res.successCount, failed: res.failureCount, invalid };
}

export async function registerPushToken(token: string) {
  const user = await requireUser();
  if (!token) return { ok: false };
  await prisma.pushToken.upsert({
    where: { token },
    create: { token, userId: user.id, platform: "web" },
    update: { userId: user.id },
  });
  return { ok: true };
}

export async function sendPushToUser(userId: string, payload: Payload) {
  const tokens = await prisma.pushToken.findMany({ where: { userId } });
  return deliver(
    tokens.map((t) => t.token),
    payload,
  );
}

export async function sendBroadcast(payload: Payload, audience: PushAudience) {
  const admin = await requireRole(["ADMIN"]);

  const where =
    audience === "CLIENT" ? { user: { role: "CLIENT" as const } } : {};
  const tokens = await prisma.pushToken.findMany({ where });
  const result = await deliver(
    tokens.map((t) => t.token),
    payload,
  );

  await prisma.pushNotification.create({
    data: {
      title: payload.title,
      body: payload.body,
      url: payload.url || null,
      audience,
      sentById: admin.id,
      deliveredCount: result.sent,
      failedCount: result.failed,
    },
  });

  revalidatePath("/admin/push");
  return { ok: true, ...result };
}
