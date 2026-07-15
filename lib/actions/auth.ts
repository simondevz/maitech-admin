"use server";

import { redirect } from "next/navigation";
import { backendFetch } from "@/lib/backend/client";
import type { LoginResponse } from "@/lib/backend/types";
import { clearSession, setSession } from "@/lib/session-server";
import { decodeJwtClaims } from "@/lib/session";

export interface LoginResult {
  ok: boolean;
  error?: string;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const result = await backendFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const claims = decodeJwtClaims(result.data.access_token);
  if (!claims) {
    return { ok: false, error: "Received an invalid session token" };
  }

  await setSession({
    accessToken: result.data.access_token,
    refreshToken: result.data.refresh_token,
    userType: claims.user_type,
    roles: claims.roles,
    accessTokenExpiresAt: Math.floor(Date.now() / 1000) + result.data.expires_in,
  });

  return { ok: true };
}

export async function logout(): Promise<never> {
  await clearSession();
  redirect("/login");
}
