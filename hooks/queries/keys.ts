import type { ProductFilter } from "@/lib/actions/products";
import type { InstallmentFilter } from "@/lib/actions/installments";

export const queryKeys = {
  categories: {
    all: ["categories"] as const,
  },
  products: {
    all: ["products"] as const,
    list: (filter?: ProductFilter) => ["products", "list", filter ?? {}] as const,
    detail: (id: string) => ["products", "detail", id] as const,
  },
  installments: {
    all: ["installments"] as const,
    list: (filter?: InstallmentFilter) =>
      ["installments", "list", filter ?? {}] as const,
    detail: (id: string) => ["installments", "detail", id] as const,
    settings: ["installments", "settings"] as const,
  },
  users: {
    all: ["users"] as const,
  },
  roles: {
    all: ["roles"] as const,
  },
  permissions: {
    all: ["permissions"] as const,
    me: ["permissions", "me"] as const,
  },
};
