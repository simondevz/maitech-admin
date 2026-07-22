import { redirect } from "next/navigation";
import { getSession } from "@/lib/session-server";
import { getMe } from "@/lib/actions/permissions";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { UserNav } from "@/components/dashboard/user-nav";
import { PermissionsProvider } from "@/components/providers/permissions-provider";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const meResult = await getMe();
  if (!meResult.ok) {
    // The backend rejects the session's JWT (expired, revoked, or the user
    // was deleted) with an auth-shaped error — treat that as a stale
    // session rather than crashing the whole dashboard.
    if (meResult.error.status === 401 || meResult.error.status === 404) {
      redirect("/api/auth/clear-session?redirectTo=" + encodeURIComponent("/login?sessionExpired=1"));
    }
    throw new Error(meResult.error.message);
  }

  return (
    <PermissionsProvider initialData={meResult.data}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-5" />
            </div>
            <UserNav />
          </header>
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </PermissionsProvider>
  );
}
