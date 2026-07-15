import { ShieldAlert } from "lucide-react";

export function PermissionDenied() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-24 text-center text-muted-foreground">
      <ShieldAlert className="size-8" />
      <p className="font-medium text-foreground">You don&apos;t have access to this page.</p>
      <p className="text-sm">Contact an administrator if you think this is a mistake.</p>
    </div>
  );
}
