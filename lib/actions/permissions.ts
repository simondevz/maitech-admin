"use server";

import { backendFetch } from "@/lib/backend/client";
import type { BackendResult, Me, PermissionGroup } from "@/lib/backend/types";

export async function listPermissions(): Promise<BackendResult<PermissionGroup[]>> {
  return backendFetch<PermissionGroup[]>("/admin/permissions");
}

export async function getMe(): Promise<BackendResult<Me>> {
  return backendFetch<Me>("/admin/me");
}
