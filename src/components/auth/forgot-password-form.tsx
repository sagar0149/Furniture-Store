"use client";

import { FormEvent, useState } from "react";

import { forgotPasswordAction } from "@/actions/auth/forgot-password";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const result = await forgotPasswordAction({
        email,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setMessage(result.message);
    } catch (error) {
      console.error(
        "Forgot password error:",
        error,
      );

      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium"
        >
          Email address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          required
          disabled={isLoading}
          className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {message && (
        <div
          role="status"
          className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="h-11 w-full rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading
          ? "Sending..."
          : "Send reset link"}
      </button>
    </form>
  );
}