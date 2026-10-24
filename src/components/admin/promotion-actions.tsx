
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deletePromotionAction,
  togglePromotionAction,
} from "@/actions/promotions";

type PromotionActionsProps = {
  id: string;
  enabled: boolean;
};

export function PromotionActions({
  id,
  enabled,
}: PromotionActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function handleToggle() {
    setMessage("");

    startTransition(async () => {
      const result = await togglePromotionAction(id, !enabled);

      setMessage(result.message);

      if (result.success) {
        router.refresh();
      }
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "Delete this promotion permanently? This cannot be undone.",
    );

    if (!confirmed) return;

    setMessage("");

    startTransition(async () => {
      const result = await deletePromotionAction(id);

      setMessage(result.message);

      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={pending}
        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
          enabled
            ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
            : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
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
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition duration-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
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
