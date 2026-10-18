"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  updatePaymentProviderStatusAction,
  setDefaultPaymentProviderAction,
} from "@/actions/admin/payment";

import type { PaymentProvider } from "@/repositories/payment.repository";

type PaymentProviderControlsProps = {
  provider: PaymentProvider;
  enabled: boolean;
  isDefault: boolean;
};

export function PaymentProviderControls({
  provider,
  enabled,
  isDefault,
}: PaymentProviderControlsProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleToggle() {
    setError("");
    setLoading(true);

    try {
      const result =
        await updatePaymentProviderStatusAction(
          provider,
          !enabled,
        );

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update payment provider.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSetDefault() {
    setError("");
    setLoading(true);

    try {
      const result =
        await setDefaultPaymentProviderAction(
          provider,
        );

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to set default provider.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full lg:w-auto">
      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          className={`inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            enabled
              ? "bg-foreground text-background hover:opacity-90"
              : "hover:bg-muted"
          }`}
        >
          {loading
            ? "Updating..."
            : enabled
              ? "Enabled"
              : "Disabled"}
        </button>

        <button
          type="button"
          onClick={handleSetDefault}
          disabled={
            loading ||
            !enabled ||
            isDefault
          }
          className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDefault
            ? "Default"
            : "Make Default"}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 text-right text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}