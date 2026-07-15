import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignRolesToUser,
  deactivateUser,
  initiatePasswordReset,
  listUsers,
} from "@/lib/actions/users";
import { createInvitation } from "@/lib/actions/invitations";
import { queryKeys } from "./keys";
import { unwrap } from "./backend-error";

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => unwrap(listUsers()),
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unwrap(deactivateUser(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useAssignRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: string[] }) =>
      unwrap(assignRolesToUser(id, roles)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useInitiatePasswordReset() {
  return useMutation({
    mutationFn: (id: string) => unwrap(initiatePasswordReset(id)),
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, roles }: { email: string; roles: string[] }) =>
      unwrap(createInvitation(email, roles)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}
