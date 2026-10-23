
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deleteDiscountAction,
  toggleDiscountAction,
} from "@/actions/discounts";

type DiscountActionsProps = {
  id: string;
  enabled: boolean;
};

export function DiscountActions({
  id,
  enabled,
}: DiscountActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function handleToggle() {
    setMessage("");

    startTransition(async () => {
      const result = await toggleDiscountAction(
        id,
        !enabled,
      );

      setMessage(result.message);

      if (result.success) {
        router.refresh();
      }
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "Delete this discount permanently? This action cannot be undone.",
    );

    if (!confirmed) return;

    setMessage("");

    startTransition(async () => {
      const result = await deleteDiscountAction(id);

      setMessage(result.message);

      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/discounts/${id}/edit`}
        className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-500 hover:text-cyan-700"
      >
        Edit
      </Link>

      <button
        type="button"
        onClick={handleToggle}
        disabled={pending}
        className={`rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          enabled
            ? "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
            : "border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
        }`}
      >
        {pending
          ? "Processing..."
          : enabled
            ? "Disable"
            : "Enable"}
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Delete
      </button>

      {message && (
        <p
          role="status"
          className="basis-full text-xs text-slate-600"
        >
          {message}
        </p>
      )}
    </div>
  );
}
