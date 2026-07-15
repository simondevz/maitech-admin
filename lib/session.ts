// Edge-compatible (Web Crypto) session cookie signing — used by both
// middleware.ts (Edge runtime) and server-only code (lib/session-server.ts).

export const SESSION_COOKIE = "admin_session";

export interface SessionPayload {
  accessToken: string;
  refreshToken?: string;
  userType: "dev_admin" | "regular";
  roles: string[];
  /** epoch seconds when accessToken expires */
  accessTokenExpiresAt: number;
}

function base64urlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    value.length + ((4 - (value.length % 4)) % 4),
    "="
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSession(
  payload: SessionPayload,
  secret: string
): Promise<string> {
  const body = base64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const sig = base64urlEncode(new Uint8Array(signature));
  return `${body}.${sig}`;
}

export async function verifySession(
  cookieValue: string | undefined,
  secret: string
): Promise<SessionPayload | null> {
  if (!cookieValue) return null;
  const [body, sig] = cookieValue.split(".");
  if (!body || !sig) return null;

  const key = await hmacKey(secret);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64urlDecode(sig) as BufferSource,
    new TextEncoder().encode(body)
  );
  if (!valid) return null;

  try {
    return JSON.parse(new TextDecoder().decode(base64urlDecode(body))) as SessionPayload;
  } catch {
    return null;
  }
}

export function isAccessTokenStale(session: SessionPayload, skewSeconds = 60): boolean {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return session.accessTokenExpiresAt - nowSeconds < skewSeconds;
}

export interface JwtClaims {
  user_id: string;
  user_type: "dev_admin" | "regular";
  roles: string[];
  exp: number;
  iat: number;
}

/**
 * Decodes (without verifying) the JWT payload issued by the backend, purely
 * to read user_type/roles for UI nav gating. The backend is the source of
 * truth for authorization on every request — this never stands in for
 * signature verification.
 */
export function decodeJwtClaims(token: string): JwtClaims | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    return JSON.parse(new TextDecoder().decode(base64urlDecode(payload))) as JwtClaims;
  } catch {
    return null;
  }
}
