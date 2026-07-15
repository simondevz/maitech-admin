/**
 * Canonical permission-string catalog, mirroring
 * backend/internal/permissions/permissions.go. Only permissions with a real,
 * routed endpoint get a constant here — `reviews.*`/`services.*` are
 * modeled on the backend but have no handlers yet, and `roles.delete` has
 * no route despite the permission existing, so neither is reachable from
 * this UI.
 *
 * See admin/PERMISSIONS.md for how this catalog is used end-to-end
 * (backend GET /admin/me -> PermissionsProvider -> useCan/PermissionButton)
 * and the hide-vs-disable rule for gating a new feature.
 */
export const PERMISSIONS = {
  productsRead: "products.read",
  productsCreate: "products.create",
  productsUpdate: "products.update",
  productsDelete: "products.delete",

  categoriesRead: "categories.read",
  categoriesCreate: "categories.create",
  categoriesUpdate: "categories.update",
  categoriesDelete: "categories.delete",

  installmentsRead: "installments.read",
  installmentsUpdate: "installments.update",

  usersRead: "users.read",
  usersUpdate: "users.update",
  usersResetPassword: "users.reset_password",

  rolesRead: "roles.read",
  rolesCreate: "roles.create",
  rolesUpdate: "roles.update",

  permissionsRead: "permissions.read",
  permissionsAssign: "permissions.assign",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Sentinel returned by GET /admin/me for super_admin, who bypasses all checks. */
export const ALL_PERMISSIONS = "*";
