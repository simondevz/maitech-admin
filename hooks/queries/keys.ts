import type { ProductFilter } from "@/lib/actions/products";

export const queryKeys = {
  categories: {
    all: ["categories"] as const,
  },
  products: {
    all: ["products"] as const,
    list: (filter?: ProductFilter) => ["products", "list", filter ?? {}] as const,
    detail: (id: number) => ["products", "detail", id] as const,
  },
};
