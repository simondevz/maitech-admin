"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useRoles } from "@/hooks/queries/useRoles";
import { useCreateInvitation } from "@/hooks/queries/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RoleChecklist } from "@/components/users/role-checklist";

export function InviteUserDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const { data: allRoles } = useRoles();
  const createInvitation = useCreateInvitation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const invitation = await createInvitation.mutateAsync({ email, roles });
      toast.success(
        invitation.dev_code
          ? `Invitation sent. Dev code: ${invitation.dev_code}`
          : "Invitation sent"
      );
      setOpen(false);
      setEmail("");
      setRoles([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invitation");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Roles</Label>
            <RoleChecklist
              roles={allRoles ?? []}
              selected={roles}
              onChange={setRoles}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createInvitation.isPending}>
              Send invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
