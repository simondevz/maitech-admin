"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/backend/client";
import type { BackendResult, Role } from "@/lib/backend/types";

export interface RoleInput {
  name: string;
  slug: string;
  description: string;
}

export async function listRoles(): Promise<BackendResult<Role[]>> {
  return backendFetch<Role[]>("/admin/roles");
}

export async function createRole(input: RoleInput): Promise<BackendResult<Role>> {
  const result = await backendFetch<Role>("/admin/roles", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (result.ok) revalidatePath("/roles");
  return result;
}

export async function assignPrivilegesToRole(
  id: string,
  permissionIds: number[]
): Promise<BackendResult<null>> {
  const result = await backendFetch<null>(`/admin/roles/${id}/privileges`, {
    method: "PUT",
    body: JSON.stringify({ permission_ids: permissionIds }),
  });
  if (result.ok) revalidatePath("/roles");
  return result;
}
