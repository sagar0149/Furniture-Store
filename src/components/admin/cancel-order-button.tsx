
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelAdminOrderAction } from "@/actions/admin-orders";

type CancelOrderButtonProps = {
  orderId: string;
  orderNumber: string;
  disabled?: boolean;
};

export function CancelOrderButton({
  orderId,
  orderNumber,
  disabled = false,
}: CancelOrderButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function handleCancel() {
    const confirmed = window.confirm(
      `Cancel order ${orderNumber}?\n\nStock will be restored. No payment refund will be issued automatically.`,
    );

    if (!confirmed) return;

    setMessage("");
    setSuccess(false);

    startTransition(async () => {
      try {
        const result = await cancelAdminOrderAction(orderId);

        setMessage(result.message);
        setSuccess(result.success);

        if (result.success) {
          router.refresh();
        }
      } catch {
        setMessage("Unable to cancel this order. Please try again.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCancel}
        disabled={disabled || pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
      >
        {pending ? "Cancelling order..." : "Cancel Order"}
      </button>

      {message && (
        <p
          role={success ? "status" : "alert"}
          className={`rounded-lg border px-3 py-2 text-sm ${
            success
              ? "border-green-300 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
              : "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
