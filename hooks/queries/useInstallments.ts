import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveInstallment,
  declineInstallment,
  forwardInstallment,
  getInstallment,
  getInstallmentSettings,
  listInstallments,
  updateInstallmentSettings,
  type InstallmentFilter,
} from "@/lib/actions/installments";
import type { InstallmentApplication, InstallmentSettings } from "@/lib/backend/types";
import { queryKeys } from "./keys";
import { unwrap } from "./backend-error";

export function useInstallments(filter?: InstallmentFilter) {
  return useQuery({
    queryKey: queryKeys.installments.list(filter),
    queryFn: () => unwrap(listInstallments(filter)),
  });
}

export function useInstallment(id: number, initialData?: InstallmentApplication) {
  return useQuery({
    queryKey: queryKeys.installments.detail(id),
    queryFn: () => unwrap(getInstallment(id)),
    enabled: Number.isFinite(id),
    initialData,
  });
}

export function useApproveInstallment(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unwrap(approveInstallment(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.installments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.installments.detail(id) });
    },
  });
}

export function useDeclineInstallment(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => unwrap(declineInstallment(id, reason)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.installments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.installments.detail(id) });
    },
  });
}

export function useForwardInstallment(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unwrap(forwardInstallment(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.installments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.installments.detail(id) });
    },
  });
}

export function useInstallmentSettings(initialData?: InstallmentSettings) {
  return useQuery({
    queryKey: queryKeys.installments.settings,
    queryFn: () => unwrap(getInstallmentSettings()),
    initialData,
  });
}

export function useUpdateInstallmentSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Omit<InstallmentSettings, "id">>) =>
      unwrap(updateInstallmentSettings(input)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.installments.settings }),
  });
}
