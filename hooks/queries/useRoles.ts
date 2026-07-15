import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignPrivilegesToRole,
  createRole,
  listRoles,
  type RoleInput,
} from "@/lib/actions/roles";
import { listPermissions } from "@/lib/actions/permissions";
import { queryKeys } from "./keys";
import { unwrap } from "./backend-error";

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: () => unwrap(listRoles()),
  });
}

export function usePermissionGroups() {
  return useQuery({
    queryKey: queryKeys.permissions.all,
    queryFn: () => unwrap(listPermissions()),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RoleInput) => unwrap(createRole(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roles.all }),
  });
}

export function useAssignPrivileges() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissionIds }: { id: string; permissionIds: number[] }) =>
      unwrap(assignPrivilegesToRole(id, permissionIds)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roles.all }),
  });
}
