"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/backend/client";
import type { BackendResult, Category } from "@/lib/backend/types";

export interface CategoryInput {
  name: string;
  slug: string;
  description: string;
}

export async function listCategories(): Promise<BackendResult<Category[]>> {
  return backendFetch<Category[]>("/admin/categories");
}

export async function createCategory(
  input: CategoryInput
): Promise<BackendResult<Category>> {
  const result = await backendFetch<Category>("/admin/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (result.ok) revalidatePath("/categories");
  return result;
}

export async function updateCategory(
  id: number,
  input: CategoryInput
): Promise<BackendResult<Category>> {
  const result = await backendFetch<Category>(`/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (result.ok) revalidatePath("/categories");
  return result;
}

export async function deleteCategory(id: number): Promise<BackendResult<null>> {
  const result = await backendFetch<null>(`/admin/categories/${id}`, {
    method: "DELETE",
  });
  if (result.ok) revalidatePath("/categories");
  return result;
}
