import { AcceptInvitationForm } from "@/components/auth/accept-invitation-form";

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; email?: string }>;
}) {
  const { code, email } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      {code && email ? (
        <AcceptInvitationForm code={code} email={email} />
      ) : (
        <div className="max-w-sm text-center">
          <p className="font-medium">This invitation link is invalid or missing information.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask your administrator to send you a new invite.
          </p>
        </div>
      )}
    </main>
  );
}
