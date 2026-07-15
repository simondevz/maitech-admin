# Permission-aware UI

The backend enforces authorization per-request (`RequirePrivilege` middleware,
see `backend/internal/middleware/require_privilege.go`), but that alone isn't
enough for a good admin experience — without frontend gating, every user sees
every nav item and every action button, then finds out what they *can't* do
by clicking into a 403. This document describes how the admin UI mirrors the
backend's real permission model so the UI reflects reality up front.

## How it works end-to-end

```
backend: GET /api/v1/admin/me   →  { user_id, user_type, name, email,
                                      is_active, roles, permissions }
                    │
                    ▼
admin/lib/actions/permissions.ts   getMe()
                    │
                    ▼
admin/app/(dashboard)/layout.tsx   fetches getMe() server-side, passes
                                    it as initialData into...
                    │
                    ▼
PermissionsProvider (components/providers/permissions-provider.tsx)
  — a React Context wrapping useMe(initialData), exposing:
    useCan(permission)        → boolean
    useCanAny([permissions])  → boolean (OR)
    useCurrentUser()          → the full Me object (name/email/etc.)
                    │
                    ▼
  AppSidebar (nav filtering)   PermissionButton (disable + tooltip)
  Page-level useCan() guards   PermissionPageGate (Server Component pages)
```

`GET /admin/me` is gated only by `Authenticate`, not `RequirePrivilege` — any
logged-in user, no matter what they can do, can see who they are. It's the
only way the frontend can know a user's real permission set, since
`/admin/permissions` (the catalog) and `/admin/roles` are themselves
permission-gated — a low-privilege user can't call them to discover their own
access.

## The hide-vs-disable rule

- **Hide** nav items and entire pages the user can't reach at all. A nav item
  with no matching `.read` permission never renders (`AppSidebar` filters
  `NAV_ITEMS` through `useCan`). Pages guard themselves the same way — direct
  URL navigation to `/roles` without `roles.read` renders `PermissionDenied`
  instead of firing a request that would 403 anyway.
- **Disable + tooltip** for an action button inside a page the user *can*
  view but can't fully act on — e.g. they can see the products list
  (`products.read`) but can't delete a row (`products.delete`). Hiding just
  that one row action would make the table layout inconsistent (some rows
  with 1 icon, some with 2) and look broken. `PermissionButton` renders the
  button `disabled`, wrapped in a `Tooltip` reading "You don't have
  permission to do this."

Rule of thumb: if the *page* is inaccessible, hide it. If the *page* is
accessible but one *action* on it isn't, disable that action.

## `dev_admin`'s real behavior

`dev_admin` exists only to bootstrap the first `super_admin` (per
`backend/internal/seed/seed.go`'s own comment: *"Can only bootstrap the
superadmin"*). It has no DB row, so `PrivilegeService.HasPrivilege` special-
cases it against a narrow whitelist (`devAdminPermissions` in
`backend/internal/service/privilege_service.go`) instead of the normal
role/permission lookup:

- `users.read` — to find the super_admin in the user list.
- `roles.read` — so the invite dialog's role checklist can load (it calls
  `GET /admin/roles`, which needs this permission regardless of who's
  asking). Side effect: this also makes the Roles nav item visible to
  dev_admin, read-only (`roles.update` isn't granted, so "Edit privileges"
  stays disabled).
- `users.reset_password` — a permission **distinct from `users.update`**,
  added specifically so dev_admin can help a locked-out super_admin reset
  their password without also being able to deactivate anyone
  (`PATCH /admin/users/:id/deactivate` still requires `users.update` only).
  The password-reset route accepts *either* permission
  (`requirePrivilegeAny(UsersUpdate, UsersResetPassword)` in `router.go`) so
  existing admin roles that already had `users.update` don't lose access —
  see `PermissionButton`'s `permission={[PERMISSIONS.usersUpdate, PERMISSIONS.usersResetPassword]}`
  on the Reset Password button for the frontend half of that OR logic.

Everything else dev_admin might try — products, categories, installments,
`users.update` (deactivate), general `roles.update`/`roles.create`,
`permissions.assign` — stays denied. The one exception outside this whitelist
is `POST /admin/invitations`, gated only by `Authenticate` for *any* logged-in
user, dev_admin included — that's why "Invite user" is left ungated in the
code rather than wrapped in a permission check that would misrepresent what
the backend actually allows.

`super_admin` bypasses all checks (`IsSuperAdmin`), so its real permission set
is "everything." `GET /admin/me` represents that as the sentinel permission
`"*"` rather than enumerating the full catalog; `useCan`/`useCanAny` treat
`"*"` as always-true (see `ALL_PERMISSIONS` in `lib/permissions.ts`).

## How to gate a new feature

1. If the permission doesn't already exist in `lib/permissions.ts`, add it —
   it must match a real, routed backend permission string
   (`backend/internal/permissions/permissions.go`). Don't add constants for
   permissions with no route (e.g. `reviews.*`/`services.*` have no handlers
   yet; `roles.delete` has no route despite the permission existing).
2. **New top-level nav section**: add `permission: PERMISSIONS.xRead` to its
   entry in `components/dashboard/nav-items.ts`.
3. **New page**: add a page-level guard.
   - If the page is already a client component (most list/detail views),
     call `const canRead = useCan(PERMISSIONS.xRead)` at the top and
     `if (!canRead) return <PermissionDenied />;` before the main render.
   - If the page fetches its own data server-side and could get a 403 back,
     check `result.error.status === 403` and return `<PermissionDenied />`
     instead of throwing (see `app/(dashboard)/products/[id]/page.tsx` for
     the pattern — 404 and 403 are both handled before the generic throw).
   - If the page is a Server Component with no server-side fetch to gate on
     (e.g. a "new X" form page), wrap its content in
     `<PermissionPageGate permission={PERMISSIONS.xCreate}>`.
4. **New action button**: replace `Button` with `PermissionButton`, passing
   `permission={PERMISSIONS.xCreate|xUpdate|xDelete}`. It's a drop-in
   replacement — same props, plus `permission`. Works with `asChild` (e.g.
   wrapping a `Link`) too; when disabled, it renders the link's own content
   inside a real `<button disabled>` rather than a disabled-looking `<a>`,
   since HTML anchors ignore the `disabled` attribute and would still
   navigate on click. `permission` also accepts an array
   (`permission={[PERMISSIONS.a, PERMISSIONS.b]}`) when a backend route
   accepts more than one permission (`requirePrivilegeAny` on the backend) —
   the button is enabled if the user holds *any* of them.
5. Dialog *submit* buttons don't usually need their own gate — if the
   dialog's *trigger* is disabled, the dialog never opens. Gate the trigger.

## Current permission → screen mapping

| Screen | Read gate | Write actions |
|---|---|---|
| Products | `products.read` | New/Save → `products.create`/`products.update`; Delete → `products.delete`; variants & images → `products.update` |
| Categories | `categories.read` | New → `categories.create`; Edit → `categories.update`; Delete → `categories.delete` |
| Installments | `installments.read` | Approve/Decline/Forward, Settings save → `installments.update` |
| Users | `users.read` | Assign roles → `permissions.assign`; Reset password → `users.update` OR `users.reset_password`; Deactivate → `users.update` only; Invite user → ungated (matches backend) |
| Roles | `roles.read` | New role → `roles.create`; Edit privileges → `roles.update` |
