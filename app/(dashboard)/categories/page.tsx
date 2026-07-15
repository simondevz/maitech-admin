"use client";

import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useCategories, useDeleteCategory } from "@/hooks/queries/useCategories";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { PermissionButton } from "@/components/shared/permission-button";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { useCan } from "@/components/providers/permissions-provider";
import { PERMISSIONS } from "@/lib/permissions";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CategoriesPage() {
  const canRead = useCan(PERMISSIONS.categoriesRead);
  const { data: categories, isLoading, isError, error } = useCategories();
  const deleteCategory = useDeleteCategory();

  if (!canRead) return <PermissionDenied />;

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organize products into browsable categories."
        actions={
          <CategoryFormDialog
            trigger={
              <PermissionButton permission={PERMISSIONS.categoriesCreate}>
                <Plus /> New category
              </PermissionButton>
            }
          />
        }
      />

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load categories"}
        </p>
      )}

      {categories && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No categories yet.
                </TableCell>
              </TableRow>
            )}
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {category.description}
                </TableCell>
                <TableCell>{category.products?.length ?? 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <CategoryFormDialog
                      category={category}
                      trigger={
                        <PermissionButton
                          permission={PERMISSIONS.categoriesUpdate}
                          variant="ghost"
                          size="icon-sm"
                        >
                          <Pencil />
                        </PermissionButton>
                      }
                    />
                    <ConfirmDialog
                      trigger={
                        <PermissionButton
                          permission={PERMISSIONS.categoriesDelete}
                          variant="ghost"
                          size="icon-sm"
                        >
                          <Trash2 />
                        </PermissionButton>
                      }
                      title={`Delete ${category.name}?`}
                      description="This cannot be undone. Products in this category will be unaffected but will lose their category link."
                      confirmLabel="Delete"
                      onConfirm={async () => {
                        try {
                          await deleteCategory.mutateAsync(category.id);
                          toast.success("Category deleted");
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
      )}
    </div>
  );
}
