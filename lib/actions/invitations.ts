"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/backend/client";
import type { BackendResult, Invitation } from "@/lib/backend/types";

export async function createInvitation(
  email: string,
  roles: string[]
): Promise<BackendResult<Invitation>> {
  const result = await backendFetch<Invitation>("/admin/invitations", {
    method: "POST",
    body: JSON.stringify({ email, roles }),
  });
  if (result.ok) revalidatePath("/users");
  return result;
}
