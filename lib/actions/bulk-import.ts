"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/backend/client";
import type { BackendResult } from "@/lib/backend/types";

export interface BulkRowResult {
  row_index: number;
  success: boolean;
  error?: string;
  warning?: string;
  id?: string;
}

export interface BulkCategoryRow {
  name: string;
  slug: string;
  description: string;
}

export interface BulkProductRow {
  category_slug: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  in_stock: boolean;
  image_urls: string[];
  features: string[];
  specs: { label: string; value: string }[];
  variants: {
    name: string;
    price_adjust: number;
    is_default: boolean;
    in_stock: boolean;
  }[];
}

export async function bulkImportCategories(
  rows: BulkCategoryRow[]
): Promise<BackendResult<BulkRowResult[]>> {
  const result = await backendFetch<BulkRowResult[]>("/admin/categories/bulk", {
    method: "POST",
    body: JSON.stringify(rows),
  });
  if (result.ok) revalidatePath("/categories");
  return result;
}

export async function bulkImportProducts(
  rows: BulkProductRow[]
): Promise<BackendResult<BulkRowResult[]>> {
  const result = await backendFetch<BulkRowResult[]>("/admin/products/bulk", {
    method: "POST",
    body: JSON.stringify(rows),
  });
  if (result.ok) revalidatePath("/products");
  return result;
}
