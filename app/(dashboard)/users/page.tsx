"use client";

import { KeyRound, ShieldCheck, UserX, Plus } from "lucide-react";
import { toast } from "sonner";

import { useDeactivateUser, useInitiatePasswordReset, useUsers } from "@/hooks/queries/useUsers";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { InviteUserDialog } from "@/components/users/invite-user-dialog";
import { AssignRolesDialog } from "@/components/users/assign-roles-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UsersPage() {
  const { data: users, isLoading, isError, error } = useUsers();
  const deactivateUser = useDeactivateUser();
  const resetPassword = useInitiatePasswordReset();

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage admin accounts and their roles."
        actions={
          <InviteUserDialog
            trigger={
              <Button>
                <Plus /> Invite user
              </Button>
            }
          />
        }
      />

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load users"}
        </p>
      )}

      {users && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No users yet.
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <Badge key={role.id} variant="secondary">
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? "default" : "outline"}>
                    {user.is_active ? "Active" : "Deactivated"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <AssignRolesDialog
                      user={user}
                      trigger={
                        <Button variant="ghost" size="icon-sm" title="Assign roles">
                          <ShieldCheck />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Reset password"
                      onClick={async () => {
                        try {
                          const result = await resetPassword.mutateAsync(user.id);
                          toast.success(`Reset code: ${result.dev_code}`);
                        } catch (err) {
                          toast.error(
                            err instanceof Error ? err.message : "Failed to reset password"
                          );
                        }
                      }}
                    >
                      <KeyRound />
                    </Button>
                    {user.is_active && (
                      <ConfirmDialog
                        trigger={
                          <Button variant="ghost" size="icon-sm" title="Deactivate">
                            <UserX />
                          </Button>
                        }
                        title={`Deactivate ${user.name}?`}
                        description="They will lose access immediately."
                        confirmLabel="Deactivate"
                        onConfirm={async () => {
                          try {
                            await deactivateUser.mutateAsync(user.id);
                            toast.success("User deactivated");
                          } catch (err) {
                            toast.error(
                              err instanceof Error ? err.message : "Failed to deactivate"
                            );
                          }
                        }}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
