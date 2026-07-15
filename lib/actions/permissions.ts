"use server";

import { backendFetch } from "@/lib/backend/client";
import type { BackendResult, PermissionGroup } from "@/lib/backend/types";

export async function listPermissions(): Promise<BackendResult<PermissionGroup[]>> {
  return backendFetch<PermissionGroup[]>("/admin/permissions");
}
