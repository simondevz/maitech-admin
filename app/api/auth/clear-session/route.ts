import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { clearSession } from "@/lib/session-server";

export async function GET(request: NextRequest) {
  await clearSession();
  const redirectTo = request.nextUrl.searchParams.get("redirectTo") || "/login";
  redirect(redirectTo);
}
