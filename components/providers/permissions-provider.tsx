"use client";

import { createContext, useContext, useMemo } from "react";
import { useMe } from "@/hooks/queries/usePermissions";
import { ALL_PERMISSIONS } from "@/lib/permissions";
import type { Me } from "@/lib/backend/types";

interface PermissionsContextValue {
  me: Me;
  can: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({
  initialData,
  children,
}: {
  initialData: Me;
  children: React.ReactNode;
}) {
  const { data: me = initialData } = useMe(initialData);

  const value = useMemo<PermissionsContextValue>(() => {
    const granted = new Set(me.permissions);
    const can = (permission: string) =>
      granted.has(ALL_PERMISSIONS) || granted.has(permission);
    return {
      me,
      can,
      canAny: (permissions: string[]) => permissions.some(can),
    };
  }, [me]);

  return (
    <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>
  );
}

export function usePermissionsContext(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error("usePermissionsContext must be used within PermissionsProvider");
  return ctx;
}

export function useCan(permission: string): boolean {
  return usePermissionsContext().can(permission);
}

export function useCanAny(permissions: string[]): boolean {
  return usePermissionsContext().canAny(permissions);
}

export function useCurrentUser(): Me {
  return usePermissionsContext().me;
}
