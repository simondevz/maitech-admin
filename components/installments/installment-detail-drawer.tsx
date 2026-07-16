import { useState } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

import type { InstallmentApplication } from "@/lib/backend/types";
import {
  useApproveInstallment,
  useDeclineInstallment,
  useInstallment,
} from "@/hooks/queries/useInstallments";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { DetailRow } from "@/components/shared/detail-row";
import { InstallmentStatusBadge } from "@/components/installments/status-badge";
import { DeclineDialog } from "@/components/installments/decline-dialog";
import { DocumentPreviewDialog } from "@/components/installments/document-preview-dialog";
import { PermissionButton } from "@/components/shared/permission-button";
import { PERMISSIONS } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function InstallmentDetailDrawer({
  application: initialApplication,
  open,
  onOpenChange,
}: {
  application: InstallmentApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: application } = useInstallment(
    initialApplication?.id ?? "",
    initialApplication ?? undefined
  );
  const applicationId = application?.id ?? "";
  const approve = useApproveInstallment(applicationId);
  const decline = useDeclineInstallment(applicationId);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const isPending = application?.status === "pending";

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={application?.customer_name ?? ""}
      description={application?.customer_email}
      footer={
        application &&
        isPending && (
          // TODO: approve/decline flow (post-approval handling, edge cases) is
          // still being finalized — buttons are disabled until it's ready.
          <div className="flex flex-wrap items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
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
                    disabled
                  >
                    <Check /> Approve
                  </PermissionButton>
                </span>
              </TooltipTrigger>
              <TooltipContent>Approve/decline flow is still being finalized.</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <DeclineDialog
                    trigger={
                      <PermissionButton
                        permission={PERMISSIONS.installmentsUpdate}
                        variant="destructive"
                        disabled
                      >
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
                </span>
              </TooltipTrigger>
              <TooltipContent>Approve/decline flow is still being finalized.</TooltipContent>
            </Tooltip>
          </div>
        )
      }
    >
      {application && (
        <div className="space-y-4">
          <DetailRow
            label="Status"
            value={<InstallmentStatusBadge status={application.status} />}
          />
          <DetailRow label="Product" value={application.product_name} />
          {application.variant_name && (
            <DetailRow label="Variant" value={application.variant_name} />
          )}
          <DetailRow label="Plan" value={application.plan_type} />
          <DetailRow label="Term" value={`${application.term_months} months`} />
          {application.plan_type === "partner" && (
            <DetailRow label="Equity" value={`${application.equity_percent}%`} />
          )}
          <DetailRow label="Phone" value={application.customer_phone} />
          {application.decline_reason && (
            <p className="text-destructive">
              Decline reason: {application.decline_reason}
            </p>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Financials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <DetailRow
                label="Total value"
                value={currency.format(application.total_value)}
              />
              <DetailRow
                label="Initial payment"
                value={currency.format(application.initial_payment)}
              />
              <DetailRow
                label="Financed amount"
                value={currency.format(application.financed_amount)}
              />
              <DetailRow
                label="Monthly payment"
                value={currency.format(application.monthly_payment)}
              />
              <DetailRow label="Doc fee" value={currency.format(application.doc_fee)} />
              <DetailRow label="Mgmt fee" value={currency.format(application.mgmt_fee)} />
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
              {(application.documents ?? []).map((doc, docIndex) => (
                <div key={doc.id} className="flex items-center justify-between">
                  <span className="capitalize">{doc.doc_type.replace(/_/g, " ")}</span>
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setPreviewIndex(docIndex)}
                  >
                    Preview
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {application?.documents && previewIndex !== null && (
        <DocumentPreviewDialog
          documents={application.documents}
          index={previewIndex}
          open={previewIndex !== null}
          onOpenChange={(nextOpen) => !nextOpen && setPreviewIndex(null)}
          onIndexChange={setPreviewIndex}
        />
      )}
    </DetailDrawer>
  );
}
