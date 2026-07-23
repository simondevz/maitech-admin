"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { Role } from "@/lib/backend/types";
import { useAssignPrivileges, usePermissionGroups } from "@/hooks/queries/useRoles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { badgeVariants } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function PermissionChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        badgeVariants({ variant: selected ? "default" : "outline" }),
        "cursor-pointer px-3 py-1 text-sm transition-colors hover:opacity-80"
      )}
    >
      {label}
    </button>
  );
}

export function EditPrivilegesDialog({
  role,
  trigger,
}: {
  role: Role;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>(
    role.permissions?.map((p) => p.id) ?? []
  );
  const { data: groups } = usePermissionGroups();
  const assignPrivileges = useAssignPrivileges();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setSelected(role.permissions?.map((p) => p.id) ?? []);
  }

  function toggleRead(readId: number, dependentIds: number[]) {
    setSelected((prev) => {
      if (prev.includes(readId)) {
        if (dependentIds.some((id) => prev.includes(id))) {
          toast.info("Removed dependent permissions");
        }
        return prev.filter((id) => id !== readId && !dependentIds.includes(id));
      }
      return [...prev, readId];
    });
  }

  function toggleDependent(id: number, readId: number) {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      return prev.includes(readId) ? [...prev, id] : [...prev, id, readId];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0) {
      toast.error("Select at least one permission");
      return;
    }
    try {
      await assignPrivileges.mutateAsync({ id: role.id, permissionIds: selected });
      toast.success("Privileges updated");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update privileges");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Privileges — {role.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {groups?.map((group) => {
            const readPermission = group.permissions.find((p) => p.action === "read");
            const dependents = group.permissions.filter((p) => p.action !== "read");

            return (
              <div key={group.name}>
                <h3 className="mb-2 text-sm font-medium capitalize">{group.name}</h3>
                {readPermission && (
                  <PermissionChip
                    label={readPermission.action}
                    selected={selected.includes(readPermission.id)}
                    onClick={() =>
                      toggleRead(
                        readPermission.id,
                        dependents.map((p) => p.id)
                      )
                    }
                  />
                )}
                {dependents.length > 0 && (
                  <div
                    className={cn(
                      "mt-2 flex flex-wrap gap-2",
                      readPermission && "ml-3 border-l-2 border-border pl-3"
                    )}
                  >
                    {dependents.map((permission) => (
                      <PermissionChip
                        key={permission.id}
                        label={permission.action}
                        selected={selected.includes(permission.id)}
                        onClick={() =>
                          readPermission
                            ? toggleDependent(permission.id, readPermission.id)
                            : setSelected((prev) =>
                                prev.includes(permission.id)
                                  ? prev.filter((id) => id !== permission.id)
                                  : [...prev, permission.id]
                              )
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <DialogFooter>
            <Button type="submit" loading={assignPrivileges.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
