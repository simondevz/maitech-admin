import type { Me, Role } from "@/lib/backend/types";

/**
 * Roles selectable in the Invite User dialog. Mirrors, and in one place
 * deliberately narrows, backend/internal/service/invite_service.go's
 * CreateInvitation role-grantability switch:
 *
 * - dev_admin: never grantable by anyone (hard backend block).
 * - super_admin: only dev_admin can grant it (and only while none exists).
 * - admin / custom roles: the backend actually also lets dev_admin grant
 *   these, but the intended UX is that dev_admin's only job is bootstrapping
 *   the super_admin, so this narrows dev_admin's options further than the
 *   backend strictly requires. Hiding a backend-legal option is always safe;
 *   the backend remains the real enforcement point either way.
 */
export function getInvitableRoles(roles: Role[], me: Me): Role[] {
  const isDevAdmin = me.user_type === "dev_admin";
  return roles.filter((role) => {
    if (role.slug === "dev_admin") return false;
    if (role.slug === "super_admin") return isDevAdmin;
    return !isDevAdmin;
  });
}

/**
 * Roles selectable in the Assign Roles dialog. Mirrors
 * backend/internal/service/role_service.go's AssignRolesToUser, which
 * unconditionally blocks dev_admin and super_admin for every caller ("system
 * roles cannot be assigned directly; use the invitation flow").
 */
export function getAssignableRoles(roles: Role[]): Role[] {
  return roles.filter((role) => role.slug !== "dev_admin" && role.slug !== "super_admin");
}
