"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import type { ProductVariant } from "@/lib/backend/types";
import { useAddVariant, useDeleteVariant, useUpdateVariant } from "@/hooks/queries/useProducts";
import { useCan } from "@/components/providers/permissions-provider";
import { PermissionButton } from "@/components/shared/permission-button";
import { PERMISSIONS } from "@/lib/permissions";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

const variantSchema = z.object({
  name: z.string().min(1, "Required"),
  price_adjust: z.coerce.number(),
  is_default: z.boolean(),
  in_stock: z.boolean(),
});

type VariantValues = z.infer<typeof variantSchema>;

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function ProductVariantsPanel({
  productId,
  basePrice,
  variants,
}: {
  productId: string;
  basePrice: number;
  variants: ProductVariant[];
}) {
  const canUpdate = useCan(PERMISSIONS.productsUpdate);
  const addVariant = useAddVariant(productId);

  const form = useForm({
    resolver: zodResolver(variantSchema),
    defaultValues: { name: "", price_adjust: 0, is_default: false, in_stock: true },
  });

  async function onAdd(values: VariantValues) {
    try {
      await addVariant.mutateAsync(values);
      toast.success("Variant added");
      form.reset({ name: "", price_adjust: 0, is_default: false, in_stock: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add variant");
    }
  }

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price adjust</TableHead>
            <TableHead>Sell price</TableHead>
            <TableHead>Default</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No variants yet.
              </TableCell>
            </TableRow>
          )}
          {variants.map((variant) => (
            <VariantRow
              key={variant.id}
              productId={productId}
              basePrice={basePrice}
              variant={variant}
              canUpdate={canUpdate}
            />
          ))}
        </TableBody>
      </Table>

      <form onSubmit={form.handleSubmit(onAdd)} className="flex items-end gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-muted-foreground">Name</label>
          <Input {...form.register("name")} disabled={!canUpdate} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Price adjust</label>
          <Input
            type="number"
            step="0.01"
            className="w-32"
            disabled={!canUpdate}
            {...form.register("price_adjust")}
          />
        </div>
        <PermissionButton
          type="submit"
          disabled={form.formState.isSubmitting}
          permission={PERMISSIONS.productsUpdate}
        >
          <Plus /> Add variant
        </PermissionButton>
      </form>
    </div>
  );
}

function VariantRow({
  productId,
  basePrice,
  variant,
  canUpdate,
}: {
  productId: string;
  basePrice: number;
  variant: ProductVariant;
  canUpdate: boolean;
}) {
  const updateVariant = useUpdateVariant(productId);
  const deleteVariant = useDeleteVariant(productId);
  const [name, setName] = useState(variant.name);

  return (
    <TableRow>
      <TableCell>
        <Input
          value={name}
          disabled={!canUpdate}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (name !== variant.name) {
              updateVariant.mutate({ variantId: variant.id, input: { name } });
            }
          }}
        />
      </TableCell>
      <TableCell>{currency.format(variant.price_adjust)}</TableCell>
      <TableCell className="font-medium">
        {currency.format(basePrice + variant.price_adjust)}
      </TableCell>
      <TableCell>
        <Switch
          checked={variant.is_default}
          disabled={!canUpdate}
          onCheckedChange={(checked) =>
            updateVariant.mutate({ variantId: variant.id, input: { is_default: checked } })
          }
        />
      </TableCell>
      <TableCell>
        <Switch
          checked={variant.in_stock}
          disabled={!canUpdate}
          onCheckedChange={(checked) =>
            updateVariant.mutate({ variantId: variant.id, input: { in_stock: checked } })
          }
        />
      </TableCell>
      <TableCell className="text-right">
        <ConfirmDialog
          trigger={
            <PermissionButton
              permission={PERMISSIONS.productsUpdate}
              variant="ghost"
              size="icon-sm"
            >
              <Trash2 />
            </PermissionButton>
          }
          title={`Delete ${variant.name}?`}
          description="This cannot be undone."
          confirmLabel="Delete"
          onConfirm={async () => {
            try {
              await deleteVariant.mutateAsync(variant.id);
              toast.success("Variant deleted");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Failed to delete");
            }
          }}
        />
      </TableCell>
    </TableRow>
  );
}
