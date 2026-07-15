import {
  LayoutDashboard,
  Package,
  Tags,
  Wallet,
  Users,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { PERMISSIONS } from "@/lib/permissions";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Omit for items every authenticated admin can see (e.g. Dashboard). */
  permission?: string;
}

// GET /admin/me (see PermissionsProvider) resolves the caller's real
// permission set, so nav items are filtered by permission in AppSidebar
// rather than shown unconditionally. See admin/PERMISSIONS.md.
export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Products", href: "/products", icon: Package, permission: PERMISSIONS.productsRead },
  {
    title: "Categories",
    href: "/categories",
    icon: Tags,
    permission: PERMISSIONS.categoriesRead,
  },
  {
    title: "Installments",
    href: "/installments",
    icon: Wallet,
    permission: PERMISSIONS.installmentsRead,
  },
  { title: "Users", href: "/users", icon: Users, permission: PERMISSIONS.usersRead },
  { title: "Roles", href: "/roles", icon: ShieldCheck, permission: PERMISSIONS.rolesRead },
];
