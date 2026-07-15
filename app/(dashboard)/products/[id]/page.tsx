import { notFound } from "next/navigation";
import { listCategories } from "@/lib/actions/categories";
import { getProduct } from "@/lib/actions/products";
import { ProductEditView } from "@/components/products/product-edit-view";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) notFound();

  const [productResult, categoriesResult] = await Promise.all([
    getProduct(productId),
    listCategories(),
  ]);

  if (!productResult.ok) {
    if (productResult.error.status === 404) notFound();
    throw new Error(productResult.error.message);
  }

  const categories = categoriesResult.ok ? categoriesResult.data : [];

  return (
    <ProductEditView
      productId={productId}
      initialProduct={productResult.data}
      categories={categories}
    />
  );
}
