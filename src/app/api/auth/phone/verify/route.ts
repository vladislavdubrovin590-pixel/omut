import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone, verifyOtpCode } from "@/lib/phone";
import {
  createPhoneSession,
  isBootstrapAdminPhone,
} from "@/lib/session";
import type { Role } from "@prisma/client";

const MAX_VERIFY_ATTEMPTS = 5;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone: rawPhone, code, name } = body;

    if (!rawPhone || !code) {
      return NextResponse.json(
        { error: "Укажите телефон и код" },
        { status: 400 },
      );
    }

    const phone = normalizePhone(String(rawPhone));
    if (!phone) {
      return NextResponse.json({ error: "Некорректный номер" }, { status: 400 });
    }

    const codeStr = String(code).replace(/\D/g, "");
    if (codeStr.length !== 6) {
      return NextResponse.json({ error: "Код — 6 цифр" }, { status: 400 });
    }

    const record = await prisma.phoneVerification.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Код истёк. Запросите новый." },
        { status: 401 },
      );
    }

    if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
      return NextResponse.json(
        { error: "Превышено число попыток. Запросите новый код." },
        { status: 401 },
      );
    }

    if (!verifyOtpCode(phone, codeStr, record.codeHash)) {
      await prisma.phoneVerification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json({ error: "Неверный код" }, { status: 401 });
    }

    await prisma.phoneVerification.delete({ where: { id: record.id } });

    const isAdmin = isBootstrapAdminPhone(phone);
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: typeof name === "string" && name.trim() ? name.trim() : null,
          role: isAdmin ? "ADMIN" : "CLIENT",
        },
      });
    } else {
      const updates: { name?: string; role?: Role } = {};
      if (typeof name === "string" && name.trim() && !user.name) {
        updates.name = name.trim();
      }
      if (isAdmin && user.role !== "ADMIN") {
        updates.role = "ADMIN";
      }
      if (Object.keys(updates).length) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updates,
        });
      }
    }

    await createPhoneSession(user);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("phone/verify error", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
