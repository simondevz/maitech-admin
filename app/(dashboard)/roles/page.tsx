"use client";

import { Plus, ShieldCheck } from "lucide-react";

import { useRoles } from "@/hooks/queries/useRoles";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { PermissionButton } from "@/components/shared/permission-button";
import { RoleFormDialog } from "@/components/roles/role-form-dialog";
import { EditPrivilegesDialog } from "@/components/roles/edit-privileges-dialog";
import { useCan } from "@/components/providers/permissions-provider";
import { PERMISSIONS } from "@/lib/permissions";
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

export default function RolesPage() {
  const canRead = useCan(PERMISSIONS.rolesRead);
  const { data: roles, isLoading, isError, error } = useRoles();

  if (!canRead) return <PermissionDenied />;

  return (
    <div>
      <PageHeader
        title="Roles"
        description="Define roles and the privileges they grant."
        actions={
          <RoleFormDialog
            trigger={
              <PermissionButton permission={PERMISSIONS.rolesCreate}>
                <Plus /> New role
              </PermissionButton>
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
          {error instanceof Error ? error.message : "Failed to load roles"}
        </p>
      )}

      {roles && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-40 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No roles yet.
                </TableCell>
              </TableRow>
            )}
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell className="text-muted-foreground">{role.slug}</TableCell>
                <TableCell>
                  <Badge variant={role.is_system ? "outline" : "secondary"}>
                    {role.is_system ? "System" : "Custom"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <EditPrivilegesDialog
                    role={role}
                    trigger={
                      <PermissionButton
                        permission={PERMISSIONS.rolesUpdate}
                        variant="outline"
                        size="sm"
                      >
                        <ShieldCheck /> Edit privileges
                      </PermissionButton>
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
