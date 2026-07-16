"use client";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { useCan } from "@/components/providers/permissions-provider";
import { PERMISSIONS } from "@/lib/permissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BulkImportCategories } from "@/components/bulk-import/bulk-import-categories";
import { BulkImportProducts } from "@/components/bulk-import/bulk-import-products";

export default function BulkImportPage() {
  const canCreateCategories = useCan(PERMISSIONS.categoriesCreate);
  const canCreateProducts = useCan(PERMISSIONS.productsCreate);

  if (!canCreateCategories && !canCreateProducts) return <PermissionDenied />;

  return (
    <div>
      <PageHeader
        title="Bulk import"
        description="Upload a CSV or Excel file to create many categories or products at once. Import categories first if the products you're about to add reference new categories."
      />

      <Tabs defaultValue={canCreateCategories ? "categories" : "products"}>
        <TabsList>
          {canCreateCategories && <TabsTrigger value="categories">Categories</TabsTrigger>}
          {canCreateProducts && <TabsTrigger value="products">Products</TabsTrigger>}
        </TabsList>
        {canCreateCategories && (
          <TabsContent value="categories">
            <BulkImportCategories />
          </TabsContent>
        )}
        {canCreateProducts && (
          <TabsContent value="products">
            <BulkImportProducts />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
