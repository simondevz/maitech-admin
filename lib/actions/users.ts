"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/backend/client";
import type { BackendResult, User } from "@/lib/backend/types";

export async function listUsers(): Promise<BackendResult<User[]>> {
  return backendFetch<User[]>("/admin/users");
}

export async function deactivateUser(id: string): Promise<BackendResult<null>> {
  const result = await backendFetch<null>(`/admin/users/${id}/deactivate`, {
    method: "PATCH",
  });
  if (result.ok) revalidatePath("/users");
  return result;
}

export async function assignRolesToUser(
  id: string,
  roles: string[]
): Promise<BackendResult<null>> {
  const result = await backendFetch<null>(`/admin/users/${id}/roles`, {
    method: "POST",
    body: JSON.stringify({ roles }),
  });
  if (result.ok) revalidatePath("/users");
  return result;
}

export async function initiatePasswordReset(
  id: string
): Promise<BackendResult<{ dev_code: string }>> {
  return backendFetch<{ dev_code: string }>(`/admin/users/${id}/password-reset`, {
    method: "POST",
  });
}
