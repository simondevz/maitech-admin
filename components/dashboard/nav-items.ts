import {
  LayoutDashboard,
  Package,
  Tags,
  Wallet,
  Users,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

// Every authenticated admin sees the full nav. The backend has no
// "my permissions" endpoint (only a permissions *catalog* behind
// permissions.read) to gate nav items against, so per-resource access is
// enforced by the backend on each request and surfaced as a 403 in the
// page itself rather than pre-filtered here.
export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Products", href: "/products", icon: Package },
  { title: "Categories", href: "/categories", icon: Tags },
  { title: "Installments", href: "/installments", icon: Wallet },
  { title: "Users", href: "/users", icon: Users },
  { title: "Roles", href: "/roles", icon: ShieldCheck },
];
