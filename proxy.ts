import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  isAccessTokenStale,
  signSession,
  verifySession,
  type SessionPayload,
} from "@/lib/session";

const PUBLIC_PATHS = ["/login"];
// Never requires auth, and never redirects away even if already logged in —
// an invited person may click the link while a different session is active
// (e.g. dev_admin testing the invite they just sent themselves).
const ALWAYS_ACCESSIBLE_PATHS = ["/accept-invitation"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAlwaysAccessible = ALWAYS_ACCESSIBLE_PATHS.some((p) => pathname.startsWith(p));
  const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;
  let session = await verifySession(cookieValue, secret);

  // Proactively refresh a stale access token so Server Components/Actions
  // downstream in this request never see an expired token.
  if (session && isAccessTokenStale(session) && session.refreshToken) {
    session = await tryRefresh(session);
  }

  if (!session && !isPublic && !isAlwaysAccessible) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (session && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();
  if (session) {
    const signed = await signSession(session, secret);
    response.cookies.set(SESSION_COOKIE, signed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

async function tryRefresh(session: SessionPayload): Promise<SessionPayload | null> {
  const baseUrl = process.env.BACKEND_API_URL;
  const apiKey = process.env.BACKEND_API_KEY;
  if (!baseUrl) return session;

  try {
    const res = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { "X-API-Key": apiKey } : {}),
      },
      body: JSON.stringify({ refresh_token: session.refreshToken }),
      cache: "no-store",
    });
    const body = await res.json();
    if (!res.ok || !body?.success) return null;

    return {
      ...session,
      accessToken: body.data.access_token,
      refreshToken: body.data.refresh_token,
      accessTokenExpiresAt: Math.floor(Date.now() / 1000) + body.data.expires_in,
    };
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
