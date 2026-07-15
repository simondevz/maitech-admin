"use client";

import { useCan } from "@/components/providers/permissions-provider";
import { PermissionDenied } from "@/components/shared/permission-denied";

/**
 * Page-level gate for Server Component pages (which can't call useCan
 * directly) that are only reachable via a route, not a list row — e.g.
 * /products/new. List/detail pages that are already client components
 * check useCan inline instead; see admin/PERMISSIONS.md.
 */
export function PermissionPageGate({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const allowed = useCan(permission);
  if (!allowed) return <PermissionDenied />;
  return <>{children}</>;
}
