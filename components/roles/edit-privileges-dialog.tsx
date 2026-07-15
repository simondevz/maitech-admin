"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { Role } from "@/lib/backend/types";
import { useAssignPrivileges, usePermissionGroups } from "@/hooks/queries/useRoles";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
          {groups?.map((group) => (
            <div key={group.name}>
              <h3 className="mb-2 text-sm font-medium capitalize">{group.name}</h3>
              <div className="flex flex-wrap gap-4">
                {group.permissions.map((permission) => {
                  const checked = selected.includes(permission.id);
                  return (
                    <div key={permission.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`perm-${permission.id}`}
                        checked={checked}
                        onCheckedChange={(value) =>
                          setSelected((prev) =>
                            value
                              ? [...prev, permission.id]
                              : prev.filter((id) => id !== permission.id)
                          )
                        }
                      />
                      <Label htmlFor={`perm-${permission.id}`} className="font-normal">
                        {permission.action}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <DialogFooter>
            <Button type="submit" disabled={assignPrivileges.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
