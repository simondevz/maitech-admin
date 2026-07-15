"use client";

import { useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";

import type { ProductImage } from "@/lib/backend/types";
import { useDeleteProductImage, useUploadProductImage } from "@/hooks/queries/useProducts";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export function ProductImagesPanel({
  productId,
  images,
}: {
  productId: number;
  images: ProductImage[];
}) {
  const uploadImage = useUploadProductImage(productId);
  const deleteImage = useDeleteProductImage(productId);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadImage.mutateAsync(file);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {images.map((image) => (
          <div key={image.id} className="group relative overflow-hidden rounded-md border">
            <Image
              src={image.url}
              alt=""
              width={200}
              height={200}
              className="aspect-square w-full object-cover"
            />
            <ConfirmDialog
              trigger={
                <Button
                  variant="destructive"
                  size="icon-sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 />
                </Button>
              }
              title="Delete image?"
              description="This cannot be undone."
              confirmLabel="Delete"
              onConfirm={async () => {
                try {
                  await deleteImage.mutateAsync(image.id);
                  toast.success("Image deleted");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Failed to delete");
                }
              }}
            />
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploadImage.isPending}
      >
        <Upload /> {uploadImage.isPending ? "Uploading..." : "Upload image"}
      </Button>
    </div>
  );
}
