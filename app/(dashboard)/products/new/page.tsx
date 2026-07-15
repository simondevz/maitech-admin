import { listCategories } from "@/lib/actions/categories";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionPageGate } from "@/components/shared/permission-page-gate";
import { ProductDetailsForm } from "@/components/products/product-details-form";
import { PERMISSIONS } from "@/lib/permissions";

export default async function NewProductPage() {
  const categoriesResult = await listCategories();
  const categories = categoriesResult.ok ? categoriesResult.data : [];

  return (
    <PermissionPageGate permission={PERMISSIONS.productsCreate}>
      <div>
        <PageHeader title="New product" />
        <ProductDetailsForm categories={categories} />
      </div>
    </PermissionPageGate>
  );
}
