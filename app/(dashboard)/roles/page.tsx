"use client";

import { Plus, ShieldCheck } from "lucide-react";

import { useRoles } from "@/hooks/queries/useRoles";
import { PageHeader } from "@/components/shared/page-header";
import { RoleFormDialog } from "@/components/roles/role-form-dialog";
import { EditPrivilegesDialog } from "@/components/roles/edit-privileges-dialog";
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

export default function RolesPage() {
  const { data: roles, isLoading, isError, error } = useRoles();

  return (
    <div>
      <PageHeader
        title="Roles"
        description="Define roles and the privileges they grant."
        actions={
          <RoleFormDialog
            trigger={
              <Button>
                <Plus /> New role
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
                      <Button variant="outline" size="sm">
                        <ShieldCheck /> Edit privileges
                      </Button>
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
