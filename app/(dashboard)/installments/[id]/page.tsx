import { notFound } from "next/navigation";
import { getInstallment } from "@/lib/actions/installments";
import { InstallmentReviewView } from "@/components/installments/installment-review-view";

export default async function InstallmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const applicationId = Number(id);
  if (!Number.isFinite(applicationId)) notFound();

  const result = await getInstallment(applicationId);
  if (!result.ok) {
    if (result.error.status === 404) notFound();
    throw new Error(result.error.message);
  }

  return (
    <InstallmentReviewView applicationId={applicationId} initialApplication={result.data} />
  );
}
