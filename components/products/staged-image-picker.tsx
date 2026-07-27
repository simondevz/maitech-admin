"use client";

import { useEffect, useMemo, useRef } from "react";
import { Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { validateImageFile } from "@/lib/upload-limits";

export function StagedImagePicker({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const valid: File[] = [];
    for (const file of selected) {
      const validationError = validateImageFile(file);
      if (validationError) {
        toast.error(validationError);
      } else {
        valid.push(file);
      }
    }
    if (valid.length > 0) onChange([...files, ...valid]);
    e.target.value = "";
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {previews.map((src, index) => (
            <div key={src} className="group relative overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a remote image */}
              <img src={src} alt="" className="aspect-square w-full object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                onClick={() => removeAt(index)}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
      <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
        <Upload /> {files.length > 0 ? "Add more images" : "Add image"}
      </Button>
      <p className="text-xs text-muted-foreground">Max 5MB per image</p>
    </div>
  );
}
