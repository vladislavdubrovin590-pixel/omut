import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { verifyPassword } from "@/lib/password";
import { createAppSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { phone: rawPhone, password } = await req.json();
    if (typeof rawPhone !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Укажите телефон и пароль" },
        { status: 400 },
      );
    }

    const phone = normalizePhone(rawPhone);
    if (!phone) {
      return NextResponse.json(
        { error: "Некорректный номер телефона" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Неверный телефон или пароль" },
        { status: 401 },
      );
    }

    await createAppSession(user);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    console.error("password auth error", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
