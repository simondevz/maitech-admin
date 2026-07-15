import { getSession } from "@/lib/session-server";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

// Placeholder shell — replaced by the full sidebar layout in the next step.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <span className="font-medium">Maritech Admin</span>
        <form action={logout} className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {session?.userType === "dev_admin" ? "dev admin" : session?.roles.join(", ")}
          </span>
          <Button type="submit" variant="outline" size="sm">
            Log out
          </Button>
        </form>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
