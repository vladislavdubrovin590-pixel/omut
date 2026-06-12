import "server-only";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export type OAuthProvider = "yandex" | "vk";

const STATE_COOKIE = "omut_oauth_state";
const NEXT_COOKIE = "omut_oauth_next";
const TTL_SEC = 10 * 60;

export function isOAuthProvider(value: string): value is OAuthProvider {
  return value === "yandex" || value === "vk";
}

export function getOAuthConfig(provider: OAuthProvider) {
  if (provider === "yandex") {
    return {
      provider,
      clientId: process.env.YANDEX_CLIENT_ID,
      clientSecret: process.env.YANDEX_CLIENT_SECRET,
      authUrl: "https://oauth.yandex.ru/authorize",
      tokenUrl: "https://oauth.yandex.ru/token",
      scope: "login:email login:info",
    };
  }

  return {
    provider,
    clientId: process.env.VK_CLIENT_ID,
    clientSecret: process.env.VK_CLIENT_SECRET,
    authUrl: "https://oauth.vk.com/authorize",
    tokenUrl: "https://oauth.vk.com/access_token",
    scope: "email",
  };
}

export function getOAuthRedirectUri(provider: OAuthProvider): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${siteUrl.replace(/\/$/, "")}/api/auth/oauth/${provider}/callback`;
}

export async function buildOAuthAuthorizeUrl(
  provider: OAuthProvider,
  next = "/cabinet",
): Promise<string> {
  const cfg = getOAuthConfig(provider);
  if (!cfg.clientId || !cfg.clientSecret) {
    throw new Error(`${provider} OAuth is not configured`);
  }

  const state = randomBytes(24).toString("base64url");
  const store = await cookies();
  store.set(STATE_COOKIE, `${provider}:${state}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TTL_SEC,
    path: "/",
  });
  store.set(NEXT_COOKIE, next || "/cabinet", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TTL_SEC,
    path: "/",
  });

  const url = new URL(cfg.authUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", cfg.clientId);
  url.searchParams.set("redirect_uri", getOAuthRedirectUri(provider));
  url.searchParams.set("state", state);
  if (cfg.scope) url.searchParams.set("scope", cfg.scope);
  return url.toString();
}

export async function consumeOAuthState(
  provider: OAuthProvider,
  state: string,
): Promise<{ ok: boolean; next: string }> {
  const store = await cookies();
  const expected = store.get(STATE_COOKIE)?.value;
  const next = store.get(NEXT_COOKIE)?.value || "/cabinet";
  store.delete(STATE_COOKIE);
  store.delete(NEXT_COOKIE);
  return { ok: expected === `${provider}:${state}`, next };
}

type ExternalProfile = {
  provider: OAuthProvider;
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
};

export async function exchangeCodeForProfile(
  provider: OAuthProvider,
  code: string,
): Promise<ExternalProfile> {
  if (provider === "yandex") return exchangeYandex(code);
  return exchangeVk(code);
}

async function exchangeYandex(code: string): Promise<ExternalProfile> {
  const cfg = getOAuthConfig("yandex");
  if (!cfg.clientId || !cfg.clientSecret) {
    throw new Error("Yandex OAuth is not configured");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
  });

  const tokenRes = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!tokenRes.ok) throw new Error("Yandex token exchange failed");
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) throw new Error("Yandex access token missing");

  const profileRes = await fetch("https://login.yandex.ru/info?format=json", {
    headers: { Authorization: `OAuth ${token.access_token}` },
  });
  if (!profileRes.ok) throw new Error("Yandex profile fetch failed");
  const p = (await profileRes.json()) as {
    id: string;
    default_email?: string;
    real_name?: string;
    display_name?: string;
    default_avatar_id?: string;
  };

  return {
    provider: "yandex",
    id: String(p.id),
    email: p.default_email?.toLowerCase() ?? null,
    name: p.real_name || p.display_name || null,
    avatarUrl: p.default_avatar_id
      ? `https://avatars.yandex.net/get-yapic/${p.default_avatar_id}/islands-200`
      : null,
  };
}

async function exchangeVk(code: string): Promise<ExternalProfile> {
  const cfg = getOAuthConfig("vk");
  if (!cfg.clientId || !cfg.clientSecret) {
    throw new Error("VK OAuth is not configured");
  }

  const tokenUrl = new URL(cfg.tokenUrl);
  tokenUrl.searchParams.set("client_id", cfg.clientId);
  tokenUrl.searchParams.set("client_secret", cfg.clientSecret);
  tokenUrl.searchParams.set("redirect_uri", getOAuthRedirectUri("vk"));
  tokenUrl.searchParams.set("code", code);

  const tokenRes = await fetch(tokenUrl.toString());
  if (!tokenRes.ok) throw new Error("VK token exchange failed");
  const token = (await tokenRes.json()) as {
    access_token?: string;
    user_id?: number;
    email?: string;
  };
  if (!token.access_token || !token.user_id) {
    throw new Error("VK access token missing");
  }

  const profileUrl = new URL("https://api.vk.com/method/users.get");
  profileUrl.searchParams.set("access_token", token.access_token);
  profileUrl.searchParams.set("user_ids", String(token.user_id));
  profileUrl.searchParams.set("fields", "photo_200");
  profileUrl.searchParams.set("v", "5.199");

  const profileRes = await fetch(profileUrl.toString());
  if (!profileRes.ok) throw new Error("VK profile fetch failed");
  const p = (await profileRes.json()) as {
    response?: Array<{
      id: number;
      first_name?: string;
      last_name?: string;
      photo_200?: string;
    }>;
  };
  const user = p.response?.[0];
  if (!user) throw new Error("VK profile missing");

  return {
    provider: "vk",
    id: String(user.id),
    email: token.email?.toLowerCase() ?? null,
    name: [user.first_name, user.last_name].filter(Boolean).join(" ") || null,
    avatarUrl: user.photo_200 ?? null,
  };
}

export async function findOrCreateOAuthUser(
  profile: ExternalProfile,
): Promise<User> {
  const account = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: profile.provider,
        providerAccountId: profile.id,
      },
    },
    include: { user: true },
  });
  if (account) {
    return prisma.user.update({
      where: { id: account.userId },
      data: {
        email: profile.email ?? account.user.email,
        name: profile.name ?? account.user.name,
        avatarUrl: profile.avatarUrl ?? account.user.avatarUrl,
      },
    });
  }

  const existingByEmail = profile.email
    ? await prisma.user.findUnique({ where: { email: profile.email } })
    : null;

  const user =
    existingByEmail ??
    (await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        role: "CLIENT",
      },
    }));

  await prisma.oAuthAccount.create({
    data: {
      userId: user.id,
      provider: profile.provider,
      providerAccountId: profile.id,
      email: profile.email,
    },
  });

  return user;
}
