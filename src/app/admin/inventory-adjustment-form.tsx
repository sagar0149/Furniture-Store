
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { adjustInventoryAction } from "@/actions/admin/inventory";

type InventoryAdjustmentFormProps = {
  productId: string;
  productName: string;
  currentQuantity: number;
};

export function InventoryAdjustmentForm({
  productId,
  productName,
  currentQuantity,
}: InventoryAdjustmentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<"RESTOCK" | "ADJUSTMENT">("RESTOCK");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);

    const parsedQuantity = Number(quantity);

    if (!Number.isSafeInteger(parsedQuantity) || parsedQuantity < 0) {
      setMessage("Enter a valid whole-number quantity.");
      return;
    }

    startTransition(async () => {
      const result = await adjustInventoryAction({
        productId,
        quantity: parsedQuantity,
        type,
        reason,
      });

      setMessage(result.message);
      setIsSuccess(result.success);

      if (result.success) {
        setReason("");
        router.refresh();
      }
    });
  }

  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-sm font-medium underline underline-offset-4">
        Adjust stock
      </summary>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
        <p className="text-sm text-muted-foreground">
          {productName} — Current stock: {currentQuantity}
        </p>

        <label className="grid gap-1 text-sm">
          Operation
          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as "RESTOCK" | "ADJUSTMENT")
            }
            disabled={isPending}
            className="rounded-md border bg-background px-3 py-2"
          >
            <option value="RESTOCK">Add stock</option>
            <option value="ADJUSTMENT">Set exact quantity</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          {type === "RESTOCK" ? "Quantity to add" : "New total quantity"}
          <input
            type="number"
            min="0"
            max="1000000"
            step="1"
            required
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            disabled={isPending}
            className="rounded-md border bg-background px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          Reason
          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
            maxLength={500}
            disabled={isPending}
            placeholder="e.g. New supplier delivery"
            className="rounded-md border bg-background px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save stock change"}
        </button>

        {message && (
          <p
            role="status"
            className={
              isSuccess
                ? "text-sm text-green-700"
                : "text-sm text-destructive"
            }
          >
            {message}
          </p>
        )}
      </form>
    </details>
  );
}
