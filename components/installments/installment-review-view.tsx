"use client";

import { toast } from "sonner";
import { Check, Forward, X } from "lucide-react";

import type { InstallmentApplication } from "@/lib/backend/types";
import {
  useApproveInstallment,
  useDeclineInstallment,
  useForwardInstallment,
  useInstallment,
} from "@/hooks/queries/useInstallments";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { PermissionButton } from "@/components/shared/permission-button";
import { InstallmentStatusBadge } from "@/components/installments/status-badge";
import { DeclineDialog } from "@/components/installments/decline-dialog";
import { useCan } from "@/components/providers/permissions-provider";
import { PERMISSIONS } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InstallmentReviewView({
  applicationId,
  initialApplication,
}: {
  applicationId: number;
  initialApplication: InstallmentApplication;
}) {
  const canRead = useCan(PERMISSIONS.installmentsRead);
  const { data: application = initialApplication } = useInstallment(
    applicationId,
    initialApplication
  );
  const approve = useApproveInstallment(applicationId);
  const decline = useDeclineInstallment(applicationId);
  const forward = useForwardInstallment(applicationId);

  if (!canRead) return <PermissionDenied />;

  const currency = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  });

  const isPending = application.status === "pending";

  return (
    <div>
      <PageHeader
        title={`Application #${application.id}`}
        description={application.customer_name}
        actions={<InstallmentStatusBadge status={application.status} />}
      />

      <div className="mb-6 space-y-1 text-sm text-muted-foreground">
        <p>
          {application.customer_email} · {application.customer_phone}
        </p>
        <p>
          Product: {application.product?.name ?? `#${application.product_id}`}
          {application.variant?.name ? ` (Variant: ${application.variant.name})` : ""}
        </p>
        <p className="capitalize">
          Plan: {application.plan_type} · {application.term_months} months ·{" "}
          {application.equity_percent}% equity
        </p>
        {application.decline_reason && (
          <p className="text-destructive">Decline reason: {application.decline_reason}</p>
        )}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Financials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Total value" value={currency.format(application.total_value)} />
            <Row
              label="Initial payment"
              value={currency.format(application.initial_payment)}
            />
            <Row
              label="Financed amount"
              value={currency.format(application.financed_amount)}
            />
            <Row
              label="Monthly payment"
              value={currency.format(application.monthly_payment)}
            />
            <Row label="Doc fee" value={currency.format(application.doc_fee)} />
            <Row label="Mgmt fee" value={currency.format(application.mgmt_fee)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(application.documents ?? []).length === 0 && (
              <p className="text-muted-foreground">No documents uploaded.</p>
            )}
            {(application.documents ?? []).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between">
                <span className="capitalize">{doc.doc_type.replace(/_/g, " ")}</span>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {isPending && (
        <div className="flex items-center gap-2">
          <PermissionButton
            permission={PERMISSIONS.installmentsUpdate}
            onClick={async () => {
              try {
                await approve.mutateAsync();
                toast.success("Application approved");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to approve");
              }
            }}
            disabled={approve.isPending}
          >
            <Check /> Approve
          </PermissionButton>
          <DeclineDialog
            trigger={
              <PermissionButton permission={PERMISSIONS.installmentsUpdate} variant="destructive">
                <X /> Decline
              </PermissionButton>
            }
            onDecline={async (reason) => {
              try {
                await decline.mutateAsync(reason);
                toast.success("Application declined");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to decline");
              }
            }}
          />
          <PermissionButton
            permission={PERMISSIONS.installmentsUpdate}
            variant="outline"
            onClick={async () => {
              try {
                await forward.mutateAsync();
                toast.success("Forwarded to partner");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to forward");
              }
            }}
            disabled={forward.isPending}
          >
            <Forward /> Forward to partner
          </PermissionButton>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
