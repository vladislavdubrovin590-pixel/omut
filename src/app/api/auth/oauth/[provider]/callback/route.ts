import { NextResponse } from "next/server";
import { createAppSession } from "@/lib/session";
import {
  consumeOAuthState,
  exchangeCodeForProfile,
  findOrCreateOAuthUser,
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
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error}`, req.url));
  }
  if (!code || !state) {
    return NextResponse.redirect(new URL("/login?error=oauth_missing", req.url));
  }

  const stateResult = await consumeOAuthState(provider, state);
  if (!stateResult.ok) {
    return NextResponse.redirect(new URL("/login?error=oauth_state", req.url));
  }

  try {
    const profile = await exchangeCodeForProfile(provider, code);
    const user = await findOrCreateOAuthUser(profile);
    await createAppSession(user);
    return NextResponse.redirect(new URL(stateResult.next || "/cabinet", req.url));
  } catch (err) {
    console.error("oauth callback error", err);
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }
}
