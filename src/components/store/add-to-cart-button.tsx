
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/actions/cart/add";
import { updateCartQuantityAction } from "@/actions/cart/update";

type Props = {
  productId: string;
  stockQuantity: number;
  initialQuantity?: number;
};

export function AddToCartButton({
  productId,
  stockQuantity,
  initialQuantity = 0,
}: Props) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function updateQuantity(next: number) {
    if (isPending || next < 1 || next > stockQuantity) return;

    setMessage("");

    startTransition(async () => {
      try {
        const result =
          quantity === 0
            ? await addToCartAction(productId, next)
            : await updateCartQuantityAction(productId, next);

        if (!result.success) {
          setMessage(result.message);
          return;
        }

        setQuantity(result.quantity ?? next);
        setMessage("Cart updated");
        router.refresh();

        window.setTimeout(() => setMessage(""), 1800);
      } catch {
        setMessage("Please try again");
      }
    });
  }

  if (stockQuantity <= 0) {
    return (
      <button
        disabled
        className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm text-gray-500"
      >
        Out of stock
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      {quantity === 0 ? (
        <button
          onClick={() => updateQuantity(1)}
          disabled={isPending}
          className="rounded-lg bg-[#453326] px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-[#604833] active:scale-95 disabled:opacity-50"
        >
          {isPending ? "Adding..." : "Add to Cart"}
        </button>
      ) : (
        <div className="inline-flex w-fit items-center gap-1 rounded-lg border border-[#e6ded2] bg-white p-1 shadow-sm transition-all duration-300 hover:border-[#cbb28e]">
          <button
            onClick={() => updateQuantity(quantity - 1)}
            disabled={isPending || quantity <= 1}
            aria-label="Decrease quantity"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#453326] transition-all duration-200 hover:bg-[#eee8de] active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            −
          </button>

          <span
            key={quantity}
            aria-live="polite"
            className="min-w-8 animate-[quantity-pop_220ms_ease-out] text-center text-sm font-medium tabular-nums"
          >
            {isPending ? "…" : quantity}
          </span>

          <button
            onClick={() => updateQuantity(quantity + 1)}
            disabled={isPending || quantity >= stockQuantity}
            aria-label="Increase quantity"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#453326] transition-all duration-200 hover:bg-[#eee8de] active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            +
          </button>
        </div>
      )}

      <p
        aria-live="polite"
        className={`text-xs transition-all duration-300 ${
          message
            ? "translate-y-0 opacity-100"
            : "-translate-y-1 opacity-0"
        } ${
          message === "Cart updated"
            ? "text-emerald-600"
            : "text-red-500"
        }`}
      >
        {message || "\u00A0"}
      </p>
    </div>
  );
}
