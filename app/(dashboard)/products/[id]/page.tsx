import { notFound } from "next/navigation";
import { listCategories } from "@/lib/actions/categories";
import { getProduct } from "@/lib/actions/products";
import { ProductEditView } from "@/components/products/product-edit-view";
import { PermissionDenied } from "@/components/shared/permission-denied";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const [productResult, categoriesResult] = await Promise.all([
    getProduct(id),
    listCategories(),
  ]);

  if (!productResult.ok) {
    if (productResult.error.status === 404) notFound();
    if (productResult.error.status === 403) return <PermissionDenied />;
    throw new Error(productResult.error.message);
  }

  const categories = categoriesResult.ok ? categoriesResult.data : [];

  return (
    <ProductEditView
      productId={id}
      initialProduct={productResult.data}
      categories={categories}
    />
  );
}
