"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/backend/client";
import type {
  BackendResult,
  Product,
  ProductImage,
  ProductVariant,
} from "@/lib/backend/types";

export interface ProductFilter {
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductFeatureInput {
  text: string;
}

export interface ProductSpecInput {
  label: string;
  value: string;
}

export interface ProductVariantInput {
  name: string;
  price_adjust: number;
  is_default: boolean;
  in_stock: boolean;
}

export interface ProductInput {
  category_id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  in_stock: boolean;
  features: ProductFeatureInput[];
  specs: ProductSpecInput[];
  variants: ProductVariantInput[];
}

export async function listProducts(
  filter?: ProductFilter
): Promise<BackendResult<Product[]>> {
  const params = new URLSearchParams();
  if (filter?.category) params.set("category", filter.category);
  if (filter?.page) params.set("page", String(filter.page));
  if (filter?.pageSize) params.set("page_size", String(filter.pageSize));
  const qs = params.toString();
  return backendFetch<Product[]>(`/admin/products${qs ? `?${qs}` : ""}`);
}

export async function getProduct(id: string): Promise<BackendResult<Product>> {
  return backendFetch<Product>(`/admin/products/${id}`);
}

export async function createProduct(
  input: ProductInput
): Promise<BackendResult<Product>> {
  const result = await backendFetch<Product>("/admin/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (result.ok) revalidatePath("/products");
  return result;
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<BackendResult<Product>> {
  const result = await backendFetch<Product>(`/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (result.ok) {
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
  }
  return result;
}

export async function deleteProduct(id: string): Promise<BackendResult<null>> {
  const result = await backendFetch<null>(`/admin/products/${id}`, {
    method: "DELETE",
  });
  if (result.ok) revalidatePath("/products");
  return result;
}

export async function addVariant(
  productId: string,
  input: ProductVariantInput
): Promise<BackendResult<ProductVariant>> {
  const result = await backendFetch<ProductVariant>(
    `/admin/products/${productId}/variants`,
    { method: "POST", body: JSON.stringify(input) }
  );
  if (result.ok) revalidatePath(`/products/${productId}`);
  return result;
}

export async function updateVariant(
  productId: string,
  variantId: number,
  input: Partial<ProductVariantInput>
): Promise<BackendResult<ProductVariant>> {
  const result = await backendFetch<ProductVariant>(
    `/admin/products/${productId}/variants/${variantId}`,
    { method: "PUT", body: JSON.stringify(input) }
  );
  if (result.ok) revalidatePath(`/products/${productId}`);
  return result;
}

export async function deleteVariant(
  productId: string,
  variantId: number
): Promise<BackendResult<null>> {
  const result = await backendFetch<null>(
    `/admin/products/${productId}/variants/${variantId}`,
    { method: "DELETE" }
  );
  if (result.ok) revalidatePath(`/products/${productId}`);
  return result;
}

export async function uploadProductImage(
  productId: string,
  file: File
): Promise<BackendResult<ProductImage>> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await backendFetch<ProductImage>(
    `/admin/products/${productId}/images`,
    { method: "POST", body: formData }
  );
  if (result.ok) revalidatePath(`/products/${productId}`);
  return result;
}

export async function deleteProductImage(
  productId: string,
  imageId: number
): Promise<BackendResult<null>> {
  const result = await backendFetch<null>(
    `/admin/products/${productId}/images/${imageId}`,
    { method: "DELETE" }
  );
  if (result.ok) revalidatePath(`/products/${productId}`);
  return result;
}
