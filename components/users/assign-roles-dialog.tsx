"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { User } from "@/lib/backend/types";
import { useRoles } from "@/hooks/queries/useRoles";
import { useAssignRoles } from "@/hooks/queries/useUsers";
import { getAssignableRoles } from "@/lib/invite-roles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RoleChecklist } from "@/components/users/role-checklist";

export function AssignRolesDialog({
  user,
  trigger,
}: {
  user: User;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<string[]>((user.roles ?? []).map((r) => r.slug));
  const { data: allRoles } = useRoles();
  const assignableRoles = getAssignableRoles(allRoles ?? []);
  const assignRoles = useAssignRoles();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setRoles((user.roles ?? []).map((r) => r.slug));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await assignRoles.mutateAsync({ id: user.id, roles });
      toast.success("Roles updated");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update roles");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Roles for {user.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <RoleChecklist roles={assignableRoles} selected={roles} onChange={setRoles} />
          <DialogFooter>
            <Button type="submit" loading={assignRoles.isPending}>
              Save roles
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
