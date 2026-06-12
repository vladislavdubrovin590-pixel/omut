import { NextResponse } from "next/server";
import {
  buildOAuthAuthorizeUrl,
  isOAuthProvider,
} from "@/lib/oauth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  if (!isOAuthProvider(provider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }

  const url = new URL(req.url);
  const next = url.searchParams.get("next") ?? "/cabinet";

  try {
    const authUrl = await buildOAuthAuthorizeUrl(provider, next);
    return NextResponse.redirect(authUrl);
  } catch (err) {
    console.error("oauth start error", err);
    return NextResponse.json(
      { error: "Провайдер входа ещё не настроен" },
      { status: 503 },
    );
  }
}
