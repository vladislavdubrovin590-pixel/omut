import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateOtpCode,
  hashOtpCode,
  normalizePhone,
} from "@/lib/phone";
import { sendPushToUser } from "@/lib/actions/push";

const CODE_TTL_MS = 10 * 60 * 1000; // 10 min
const MAX_SENDS_PER_HOUR = 5;

export async function POST(req: Request) {
  try {
    const { phone: rawPhone } = await req.json();
    if (!rawPhone || typeof rawPhone !== "string") {
      return NextResponse.json({ error: "Укажите номер телефона" }, { status: 400 });
    }

    const phone = normalizePhone(rawPhone);
    if (!phone) {
      return NextResponse.json(
        { error: "Некорректный номер. Формат: +7 9XX XXX-XX-XX" },
        { status: 400 },
      );
    }

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSends = await prisma.phoneVerification.count({
      where: { phone, createdAt: { gte: hourAgo } },
    });
    if (recentSends >= MAX_SENDS_PER_HOUR) {
      return NextResponse.json(
        { error: "Слишком много запросов. Попробуйте через час." },
        { status: 429 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { phone },
      include: { pushTokens: true },
    });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Этот номер ещё не зарегистрирован. Первый вход нужно привязать в студии у администратора или сотрудника.",
        },
        { status: 404 },
      );
    }

    if (existing.pushTokens.length === 0) {
      return NextResponse.json(
        {
          error:
            "Для этого номера ещё нет привязанного устройства. Откройте кабинет в студии и включите push-уведомления.",
        },
        { status: 409 },
      );
    }

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);

    await prisma.phoneVerification.deleteMany({ where: { phone } });
    await prisma.phoneVerification.create({
      data: { phone, codeHash: hashOtpCode(phone, code), expiresAt },
    });

    const push = await sendPushToUser(existing.id, {
      title: "Код для входа в Омут",
      body: `Ваш код: ${code}. Действует 10 минут.`,
      url: "/login",
    });

    if (push.sent === 0) {
      return NextResponse.json(
        {
          error:
            "Не удалось доставить push-код. Проверьте, что уведомления разрешены для сайта.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      phone,
      delivered: push.sent,
    });
  } catch (err) {
    console.error("phone/send error", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}