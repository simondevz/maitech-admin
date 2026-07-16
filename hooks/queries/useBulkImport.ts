import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  bulkImportCategories,
  bulkImportProducts,
  type BulkCategoryRow,
  type BulkProductRow,
} from "@/lib/actions/bulk-import";
import { queryKeys } from "./keys";
import { unwrap } from "./backend-error";

export function useBulkImportCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rows: BulkCategoryRow[]) => unwrap(bulkImportCategories(rows)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
}

export function useBulkImportProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rows: BulkProductRow[]) => unwrap(bulkImportProducts(rows)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
  });
}
