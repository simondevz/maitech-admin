"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/backend/client";
import type {
  BackendResult,
  InstallmentApplication,
  InstallmentSettings,
  PlanType,
} from "@/lib/backend/types";

export interface InstallmentFilter {
  status?: string;
  planType?: PlanType;
  page?: number;
  pageSize?: number;
}

export async function listInstallments(
  filter?: InstallmentFilter
): Promise<BackendResult<InstallmentApplication[]>> {
  const params = new URLSearchParams();
  if (filter?.status) params.set("status", filter.status);
  if (filter?.planType) params.set("plan_type", filter.planType);
  if (filter?.page) params.set("page", String(filter.page));
  if (filter?.pageSize) params.set("page_size", String(filter.pageSize));
  const qs = params.toString();
  return backendFetch<InstallmentApplication[]>(
    `/admin/installments${qs ? `?${qs}` : ""}`
  );
}

export async function getInstallment(
  id: string
): Promise<BackendResult<InstallmentApplication>> {
  return backendFetch<InstallmentApplication>(`/admin/installments/${id}`);
}

export async function approveInstallment(id: string): Promise<BackendResult<null>> {
  const result = await backendFetch<null>(`/admin/installments/${id}/approve`, {
    method: "PATCH",
  });
  if (result.ok) {
    revalidatePath("/installments");
    revalidatePath(`/installments/${id}`);
  }
  return result;
}

export async function declineInstallment(
  id: string,
  reason: string
): Promise<BackendResult<null>> {
  const result = await backendFetch<null>(`/admin/installments/${id}/decline`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
  if (result.ok) {
    revalidatePath("/installments");
    revalidatePath(`/installments/${id}`);
  }
  return result;
}

export async function forwardInstallment(id: string): Promise<BackendResult<null>> {
  const result = await backendFetch<null>(`/admin/installments/${id}/forward`, {
    method: "POST",
  });
  if (result.ok) {
    revalidatePath("/installments");
    revalidatePath(`/installments/${id}`);
  }
  return result;
}

export async function getInstallmentSettings(): Promise<
  BackendResult<InstallmentSettings>
> {
  return backendFetch<InstallmentSettings>("/admin/installments/settings");
}

export async function updateInstallmentSettings(
  input: Partial<Omit<InstallmentSettings, "id">>
): Promise<BackendResult<InstallmentSettings>> {
  const result = await backendFetch<InstallmentSettings>(
    "/admin/installments/settings",
    { method: "PUT", body: JSON.stringify(input) }
  );
  if (result.ok) revalidatePath("/installments/settings");
  return result;
}
