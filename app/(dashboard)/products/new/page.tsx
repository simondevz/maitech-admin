import { listCategories } from "@/lib/actions/categories";
import { PageHeader } from "@/components/shared/page-header";
import { ProductDetailsForm } from "@/components/products/product-details-form";

export default async function NewProductPage() {
  const categoriesResult = await listCategories();
  const categories = categoriesResult.ok ? categoriesResult.data : [];

  return (
    <div>
      <PageHeader title="New product" />
      <ProductDetailsForm categories={categories} />
    </div>
  );
}
