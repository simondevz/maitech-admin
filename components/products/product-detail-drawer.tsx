import Link from "next/link";
import Image from "next/image";
import { ImageOff, Pencil } from "lucide-react";

import type { Product } from "@/lib/backend/types";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { DetailRow } from "@/components/shared/detail-row";
import { Badge } from "@/components/ui/badge";
import { PermissionButton } from "@/components/shared/permission-button";
import { PERMISSIONS } from "@/lib/permissions";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function ProductDetailDrawer({
  product,
  open,
  onOpenChange,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={product?.name ?? ""}
      description={product?.category?.name}
      footer={
        product && (
          <PermissionButton permission={PERMISSIONS.productsUpdate} asChild>
            <Link href={`/products/${product.id}`}>
              <Pencil /> Edit product
            </Link>
          </PermissionButton>
        )
      }
    >
      {product && (
        <div className="space-y-4">
          <DetailRow label="Category" value={product.category?.name ?? "—"} />
          <DetailRow label="Price" value={currency.format(product.base_price)} />
          <DetailRow
            label="Stock"
            value={
              <Badge variant={product.in_stock ? "default" : "secondary"}>
                {product.in_stock ? "In stock" : "Out of stock"}
              </Badge>
            }
          />
          <div>
            <p className="mb-1 text-muted-foreground">Description</p>
            <p className="font-medium">{product.description || "—"}</p>
          </div>

          <div>
            <p className="mb-2 text-muted-foreground">Images</p>
            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-md border"
                  >
                    <Image
                      src={image.url}
                      alt=""
                      width={100}
                      height={100}
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <ImageOff className="size-4" /> No images
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-muted-foreground">Variants</p>
            {product.variants && product.variants.length > 0 ? (
              <div className="space-y-2">
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div>
                      <p className="font-medium">
                        {variant.name}
                        {variant.is_default && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (default)
                          </span>
                        )}
                      </p>
                      <Badge
                        variant={variant.in_stock ? "default" : "secondary"}
                        className="mt-1"
                      >
                        {variant.in_stock ? "In stock" : "Out of stock"}
                      </Badge>
                    </div>
                    <p className="font-medium">
                      {currency.format(product.base_price + variant.price_adjust)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No variants</p>
            )}
          </div>
        </div>
      )}
    </DetailDrawer>
  );
}
