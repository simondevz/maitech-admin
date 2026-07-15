import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/actions/permissions";
import type { Me } from "@/lib/backend/types";
import { queryKeys } from "./keys";
import { unwrap } from "./backend-error";

export function useMe(initialData?: Me) {
  return useQuery({
    queryKey: queryKeys.permissions.me,
    queryFn: () => unwrap(getMe()),
    initialData,
  });
}
