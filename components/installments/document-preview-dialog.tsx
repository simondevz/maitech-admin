import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

import type { InstallmentDocument } from "@/lib/backend/types";
import { isImageUrl } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DocumentPreviewDialog({
  documents,
  index,
  open,
  onOpenChange,
  onIndexChange,
}: {
  documents: InstallmentDocument[];
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
}) {
  const doc = documents[index];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {doc && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between gap-4 pr-6">
                <span className="capitalize">{doc.doc_type.replace(/_/g, " ")}</span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === 0}
                    onClick={() => onIndexChange(index - 1)}
                  >
                    <ChevronLeft />
                  </Button>
                  <span className="text-sm font-normal text-muted-foreground">
                    {index + 1} / {documents.length}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === documents.length - 1}
                    onClick={() => onIndexChange(index + 1)}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="h-[70vh] overflow-hidden rounded-md border bg-muted">
              {isImageUrl(doc.file_url) ? (
                // eslint-disable-next-line @next/next/no-img-element -- Cloudinary-hosted document, not an optimizable local asset
                <img
                  src={doc.file_url}
                  alt={doc.doc_type}
                  className="size-full object-contain"
                />
              ) : (
                <iframe
                  src={doc.file_url}
                  title={doc.doc_type}
                  className="size-full"
                />
              )}
            </div>

            <a
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ExternalLink className="size-3.5" /> Open in new tab
            </a>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
