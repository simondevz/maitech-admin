"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageOff, Plus, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import type { Product } from "@/lib/backend/types";
import { useCategories } from "@/hooks/queries/useCategories";
import { useDeleteProduct, useProducts } from "@/hooks/queries/useProducts";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { PermissionButton } from "@/components/shared/permission-button";
import { ProductDetailDrawer } from "@/components/products/product-detail-drawer";
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
  const [selected, setSelected] = useState<Product | null>(null);

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
                <TableHead className="w-14"></TableHead>
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
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(product)}
                >
                  <TableCell>
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt=""
                        width={40}
                        height={40}
                        className="aspect-square size-10 rounded-md border object-cover"
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                        <ImageOff className="size-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
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
                    <div
                      className="flex justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
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

      <ProductDetailDrawer
        product={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}
