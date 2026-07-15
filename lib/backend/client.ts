import "server-only";

import { getSession } from "@/lib/session-server";
import type { BackendError, BackendResult, Pagination } from "./types";

const API_KEY_HEADER = "X-API-Key";

interface BackendEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: Pagination;
  error?: { code: string; hint?: string; service?: string };
}

/**
 * Server-only fetch wrapper for the Go backend. Attaches the shared
 * X-API-Key on every request and, when a session exists, the session's
 * JWT as a Bearer token. Callers that need to force an unauthenticated
 * request (e.g. login) simply won't have a session cookie yet.
 */
export async function backendFetch<T>(
  path: string,
  init?: RequestInit
): Promise<BackendResult<T>> {
  const baseUrl = process.env.BACKEND_API_URL;
  if (!baseUrl) {
    return { ok: false, error: fail("CONFIG_ERROR", "BACKEND_API_URL is not configured", 500) };
  }

  const headers = new Headers(init?.headers);
  const apiKey = process.env.BACKEND_API_KEY;
  if (apiKey) headers.set(API_KEY_HEADER, apiKey);

  const session = await getSession();
  if (session && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const isFormData = init?.body instanceof FormData;
  if (!isFormData && init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, { ...init, headers, cache: "no-store" });
  } catch {
    return { ok: false, error: fail("NETWORK_ERROR", "Could not reach the backend", 0) };
  }

  let body: BackendEnvelope<T> | undefined;
  try {
    body = await res.json();
  } catch {
    return {
      ok: false,
      error: fail("PARSE_ERROR", res.statusText || "Invalid response from backend", res.status),
    };
  }

  if (!body || !body.success) {
    return {
      ok: false,
      error: {
        code: body?.error?.code ?? "UNKNOWN",
        message: body?.message ?? "Request failed",
        hint: body?.error?.hint,
        status: res.status,
      },
    };
  }

  return { ok: true, data: body.data as T, pagination: body.pagination };
}

function fail(code: string, message: string, status: number): BackendError {
  return { code, message, status };
}
