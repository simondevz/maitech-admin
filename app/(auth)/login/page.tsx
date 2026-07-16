import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; sessionExpired?: string }>;
}) {
  const { email, sessionExpired } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <LoginForm
        defaultEmail={email}
        notice={sessionExpired ? "Your session has expired. Please sign in again." : undefined}
      />
    </main>
  );
}
