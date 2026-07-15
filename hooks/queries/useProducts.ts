import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addVariant,
  createProduct,
  deleteProduct,
  deleteProductImage,
  deleteVariant,
  getProduct,
  listProducts,
  updateProduct,
  updateVariant,
  uploadProductImage,
  type ProductFilter,
  type ProductInput,
  type ProductVariantInput,
} from "@/lib/actions/products";
import type { Product } from "@/lib/backend/types";
import { queryKeys } from "./keys";
import { unwrap } from "./backend-error";

export function useProducts(filter?: ProductFilter) {
  return useQuery({
    queryKey: queryKeys.products.list(filter),
    queryFn: () => unwrap(listProducts(filter)),
  });
}

export function useProduct(id: number, initialData?: Product) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => unwrap(getProduct(id)),
    enabled: Number.isFinite(id),
    initialData,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => unwrap(createProduct(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
  });
}

export function useUpdateProduct(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ProductInput>) => unwrap(updateProduct(id, input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => unwrap(deleteProduct(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
  });
}

export function useAddVariant(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductVariantInput) => unwrap(addVariant(productId, input)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) }),
  });
}

export function useUpdateVariant(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      variantId,
      input,
    }: {
      variantId: number;
      input: Partial<ProductVariantInput>;
    }) => unwrap(updateVariant(productId, variantId, input)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) }),
  });
}

export function useDeleteVariant(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variantId: number) => unwrap(deleteVariant(productId, variantId)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) }),
  });
}

export function useUploadProductImage(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => unwrap(uploadProductImage(productId, file)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) }),
  });
}

export function useDeleteProductImage(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: number) => unwrap(deleteProductImage(productId, imageId)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) }),
  });
}
