import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Forgot your password?
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we'll help you
            reset your password.
          </p>
        </div>

        <ForgotPasswordForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}