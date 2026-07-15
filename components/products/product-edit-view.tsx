"use client";

import type { Category, Product } from "@/lib/backend/types";
import { useProduct } from "@/hooks/queries/useProducts";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { ProductDetailsForm } from "@/components/products/product-details-form";
import { ProductVariantsPanel } from "@/components/products/product-variants-panel";
import { ProductImagesPanel } from "@/components/products/product-images-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCan } from "@/components/providers/permissions-provider";
import { PERMISSIONS } from "@/lib/permissions";

export function ProductEditView({
  productId,
  initialProduct,
  categories,
}: {
  productId: number;
  initialProduct: Product;
  categories: Category[];
}) {
  const canRead = useCan(PERMISSIONS.productsRead);
  const { data: product = initialProduct } = useProduct(productId, initialProduct);

  if (!canRead) return <PermissionDenied />;

  return (
    <div>
      <PageHeader title={product.name} description={`/products/${product.slug}`} />
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <ProductDetailsForm product={product} categories={categories} />
        </TabsContent>
        <TabsContent value="variants">
          <ProductVariantsPanel productId={product.id} variants={product.variants ?? []} />
        </TabsContent>
        <TabsContent value="images">
          <ProductImagesPanel productId={product.id} images={product.images ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
