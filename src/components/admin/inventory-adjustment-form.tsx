
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adjustInventoryAction } from "@/actions/admin/inventory";

type Props = {
  productId: string;
  productName: string;
  currentQuantity: number;
};

export function InventoryAdjustmentForm({
  productId,
  productName,
  currentQuantity,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState<"RESTOCK" | "ADJUSTMENT">("RESTOCK");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);

    const parsedQuantity = Number(quantity);

    if (
      !Number.isSafeInteger(parsedQuantity) ||
      parsedQuantity < 0 ||
      parsedQuantity > 1_000_000
    ) {
      setMessage("Enter a whole number between 0 and 1,000,000.");
      return;
    }

    if (!reason.trim()) {
      setMessage("Please enter a reason for this stock change.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await adjustInventoryAction({
          productId,
          quantity: parsedQuantity,
          type,
          reason,
        });

        setMessage(result.message);
        setSuccess(result.success);

        if (result.success) {
          setReason("");
          router.refresh();
        }
      } catch {
        setMessage("Unable to update stock. Please try again.");
        setSuccess(false);
      }
    });
  }

  return (
    <details className="group relative min-w-[260px]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700 transition-colors group-hover:bg-cyan-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 5v14m-7-7h14"
              />
            </svg>
          </span>
          <span>Adjust stock</span>
        </span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m6 9 6 6 6-6"
          />
        </svg>
      </summary>

      <form
        onSubmit={handleSubmit}
        className="mt-3 grid min-w-0 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60 sm:p-5"
      >
        {/* Product and stock overview */}
        <div className="rounded-xl border border-cyan-100 bg-gradient-to-br from-slate-50 to-cyan-50/70 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-white text-cyan-700 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 8.5 12 4l8 4.5v8L12 21l-8-4.5v-8Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 8.7 7.5 4.4 7.5-4.4M12 13.1V21M8 6.3l8 4.6"
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Inventory adjustment
              </p>
              <h3 className="mt-1 break-words text-sm font-bold leading-5 text-slate-900">
                {productName}
              </h3>
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between gap-3 border-t border-cyan-100 pt-3">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Current stock
              </p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                {currentQuantity}
                <span className="ml-1.5 text-xs font-medium text-slate-500">
                  units
                </span>
              </p>
            </div>

            <span
              className={`mb-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                currentQuantity === 0
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : currentQuantity <= 5
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  currentQuantity === 0
                    ? "bg-rose-500"
                    : currentQuantity <= 5
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
              />
              {currentQuantity === 0
                ? "Out of stock"
                : currentQuantity <= 5
                  ? "Low stock"
                  : "In stock"}
            </span>
          </div>
        </div>

        {/* Operation selector */}
        <fieldset disabled={pending} className="grid gap-2">
          <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            Stock operation
          </legend>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("RESTOCK")}
              aria-pressed={type === "RESTOCK"}
              className={`flex min-w-0 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 ${
                type === "RESTOCK"
                  ? "border-cyan-500 bg-cyan-50 text-cyan-900 shadow-sm ring-1 ring-cyan-500/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  type === "RESTOCK"
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14m-7-7h14"
                  />
                </svg>
              </span>
              <span className="text-xs font-bold">Add stock</span>
              <span className="text-[10px] opacity-75">Increase quantity</span>
            </button>

            <button
              type="button"
              onClick={() => setType("ADJUSTMENT")}
              aria-pressed={type === "ADJUSTMENT"}
              className={`flex min-w-0 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 ${
                type === "ADJUSTMENT"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-900 shadow-sm ring-1 ring-indigo-500/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  type === "ADJUSTMENT"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 7h16M7 4v6m10 4v6M4 17h16"
                  />
                </svg>
              </span>
              <span className="text-xs font-bold">Set quantity</span>
              <span className="text-[10px] opacity-75">Replace total</span>
            </button>
          </div>
        </fieldset>

        {/* Quantity */}
        <label className="grid gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            {type === "RESTOCK" ? "Quantity to add" : "New total quantity"}
          </span>

          <span className="relative block">
            <input
              type="number"
              min="0"
              max="1000000"
              step="1"
              required
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              disabled={pending}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-16 text-base font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-medium text-slate-400">
              units
            </span>
          </span>

          <span className="text-[11px] leading-4 text-slate-500">
            {type === "RESTOCK"
              ? `Adds to the existing stock of ${currentQuantity} units.`
              : "Sets the product stock to the exact quantity entered."}
          </span>
        </label>

        {/* Reason */}
        <label className="grid gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Reason for change
          </span>

          <span className="relative block">
            <span className="pointer-events-none absolute left-3 top-3 text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                />
              </svg>
            </span>

            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
              maxLength={500}
              disabled={pending}
              placeholder="e.g. New supplier delivery"
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </span>

          <span className="text-right text-[10px] text-slate-400">
            {reason.length}/500 characters
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={pending}
          className="group/save flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition-all hover:-translate-y-0.5 hover:from-cyan-500 hover:to-blue-500 hover:shadow-xl hover:shadow-cyan-600/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {pending ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Saving changes...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5 transition-transform group-hover/save:scale-110"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m5 12 4 4L19 6"
                />
              </svg>
              Save stock adjustment
            </>
          )}
        </button>

        {/* Accessible feedback */}
        {message && (
          <div
            role={success ? "status" : "alert"}
            aria-live="polite"
            className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs font-medium leading-5 ${
              success
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <span className="mt-0.5 font-bold" aria-hidden="true">
              {success ? "✓" : "!"}
            </span>
            <span>{message}</span>
          </div>
        )}

        <p className="text-center text-[10px] leading-4 text-slate-400">
          Stock changes are recorded in your inventory transaction history.
        </p>
      </form>
    </details>
  );
}
