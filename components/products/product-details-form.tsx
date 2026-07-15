"use client";

import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import type { Category, Product } from "@/lib/backend/types";
import { useCreateProduct, useUpdateProduct } from "@/hooks/queries/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const productSchema = z.object({
  category_id: z.coerce.number().min(1, "Category is required"),
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string(),
  base_price: z.coerce.number().min(0, "Price must be positive"),
  in_stock: z.boolean(),
  features: z.array(z.object({ text: z.string().min(1, "Required") })),
  specs: z.array(
    z.object({ label: z.string().min(1, "Required"), value: z.string().min(1, "Required") })
  ),
});

type ProductValues = z.infer<typeof productSchema>;

export function ProductDetailsForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const isEdit = !!product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(product?.id ?? 0);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category_id: product?.category_id ?? 0,
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      base_price: product?.base_price ?? 0,
      in_stock: product?.in_stock ?? true,
      features: product?.features.map((f) => ({ text: f.text })) ?? [],
      specs: product?.specs.map((s) => ({ label: s.label, value: s.value })) ?? [],
    },
  });

  const featuresArray = useFieldArray({ control: form.control, name: "features" });
  const specsArray = useFieldArray({ control: form.control, name: "specs" });

  async function onSubmit(values: ProductValues) {
    try {
      if (isEdit) {
        await updateProduct.mutateAsync(values);
        toast.success("Product saved");
      } else {
        const created = await createProduct.mutateAsync({ ...values, variants: [] });
        toast.success("Product created");
        router.push(`/products/${created.id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="base_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base price (₦)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    value={field.value as number}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="in_stock"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0">In stock</FormLabel>
            </FormItem>
          )}
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium">Features</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => featuresArray.append({ text: "" })}
            >
              <Plus /> Add feature
            </Button>
          </div>
          <div className="space-y-2">
            {featuresArray.fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input {...form.register(`features.${index}.text`)} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => featuresArray.remove(index)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium">Specs</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => specsArray.append({ label: "", value: "" })}
            >
              <Plus /> Add spec
            </Button>
          </div>
          <div className="space-y-2">
            {specsArray.fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input
                  placeholder="Label"
                  {...form.register(`specs.${index}.label`)}
                />
                <Input
                  placeholder="Value"
                  {...form.register(`specs.${index}.value`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => specsArray.remove(index)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {isEdit ? "Save changes" : "Create product"}
        </Button>
      </form>
    </Form>
  );
}
