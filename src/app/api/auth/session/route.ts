import { NextResponse } from "next/server";
import { createSession, destroySession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "idToken required" }, { status: 400 });
    }
    const user = await createSession(idToken);
    return NextResponse.json({
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("session POST error", err);
    return NextResponse.json(
      { error: "Не удалось создать сессию" },
      { status: 401 },
    );
  }
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
