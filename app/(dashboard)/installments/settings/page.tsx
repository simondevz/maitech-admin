import { getInstallmentSettings } from "@/lib/actions/installments";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { InstallmentSettingsForm } from "@/components/installments/installment-settings-form";

export default async function InstallmentSettingsPage() {
  const result = await getInstallmentSettings();
  if (!result.ok) {
    if (result.error.status === 403) return <PermissionDenied />;
    throw new Error(result.error.message);
  }

  return (
    <div>
      <PageHeader
        title="Installment settings"
        description="Configure Maritech financing terms and partner forwarding."
      />
      <InstallmentSettingsForm settings={result.data} />
    </div>
  );
}
