import { Badge } from "@/components/ui/badge";
import type { InstallmentStatus } from "@/lib/backend/types";

const STATUS_VARIANT: Record<
  InstallmentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  approved: "default",
  declined: "destructive",
  forwarded: "outline",
};

export function InstallmentStatusBadge({ status }: { status: InstallmentStatus }) {
  return <Badge variant={STATUS_VARIANT[status] ?? "secondary"}>{status}</Badge>;
}
