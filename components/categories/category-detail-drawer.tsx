import { Pencil } from "lucide-react";

import type { Category } from "@/lib/backend/types";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { DetailRow } from "@/components/shared/detail-row";
import { PermissionButton } from "@/components/shared/permission-button";
import { PERMISSIONS } from "@/lib/permissions";

export function CategoryDetailDrawer({
  category,
  open,
  onOpenChange,
  onEdit,
}: {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}) {
  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={category?.name ?? ""}
      description={category?.slug}
      footer={
        <PermissionButton permission={PERMISSIONS.categoriesUpdate} onClick={onEdit}>
          <Pencil /> Edit
        </PermissionButton>
      }
    >
      {category && (
        <div className="space-y-4">
          <DetailRow label="Name" value={category.name} />
          <DetailRow label="Slug" value={category.slug} />
          <DetailRow label="Products" value={category.products?.length ?? 0} />
          <div>
            <p className="mb-1 text-muted-foreground">Description</p>
            <p className="font-medium">{category.description || "—"}</p>
          </div>
        </div>
      )}
    </DetailDrawer>
  );
}
