import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/cabinet", "/worker", "/admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has("omut_session");

  if (PROTECTED.some((p) => pathname.startsWith(p)) && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/cabinet/:path*", "/worker/:path*", "/admin/:path*"],
};
