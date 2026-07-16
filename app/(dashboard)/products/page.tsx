"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { useCategories } from "@/hooks/queries/useCategories";
import { useDeleteProduct, useProducts } from "@/hooks/queries/useProducts";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { PermissionButton } from "@/components/shared/permission-button";
import { useCan } from "@/components/providers/permissions-provider";
import { PERMISSIONS } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 20;

export default function ProductsPage() {
  const canRead = useCan(PERMISSIONS.productsRead);
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data: categories } = useCategories();
  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useProducts({
    category: category === "all" ? undefined : category,
    page,
    pageSize: PAGE_SIZE,
  });
  const deleteProduct = useDeleteProduct();

  const currency = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  });

  if (!canRead) return <PermissionDenied />;

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage the product catalog."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/products/bulk-import">
                <Upload /> Bulk import
              </Link>
            </Button>
            <PermissionButton permission={PERMISSIONS.productsCreate} asChild>
              <Link href="/products/new">
                <Plus /> New product
              </Link>
            </PermissionButton>
          </>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <Select
          value={category}
          onValueChange={(value) => {
            setCategory(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load products"}
        </p>
      )}

      {products && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <Link href={`/products/${product.id}`} className="hover:underline">
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.category?.name ?? "—"}
                  </TableCell>
                  <TableCell>{currency.format(product.base_price)}</TableCell>
                  <TableCell>
                    <Badge variant={product.in_stock ? "default" : "secondary"}>
                      {product.in_stock ? "In stock" : "Out of stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/products/${product.id}`}>
                          <Pencil />
                        </Link>
                      </Button>
                      <ConfirmDialog
                        trigger={
                          <PermissionButton
                            permission={PERMISSIONS.productsDelete}
                            variant="ghost"
                            size="icon-sm"
                          >
                            <Trash2 />
                          </PermissionButton>
                        }
                        title={`Delete ${product.name}?`}
                        description="This cannot be undone."
                        confirmLabel="Delete"
                        onConfirm={async () => {
                          try {
                            await deleteProduct.mutateAsync(product.id);
                            toast.success("Product deleted");
                          } catch (err) {
                            toast.error(
                              err instanceof Error ? err.message : "Failed to delete"
                            );
                          }
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  {page}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (products.length === PAGE_SIZE) setPage((p) => p + 1);
                  }}
                  className={
                    products.length < PAGE_SIZE ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  );
}
