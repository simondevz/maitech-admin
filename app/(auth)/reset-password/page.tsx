import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      {code ? (
        <ResetPasswordForm code={code} />
      ) : (
        <div className="max-w-sm text-center">
          <p className="font-medium">This reset link is invalid or missing information.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask your administrator to issue a new password reset.
          </p>
        </div>
      )}
    </main>
  );
}
