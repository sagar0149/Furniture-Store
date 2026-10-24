
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updateCartItemAction } from "@/actions/cart/update";
import { removeCartItemAction } from "@/actions/cart/remove";

type CartItemControlsProps = {
  cartItemId: string;
  quantity: number;
  stockQuantity: number;
};

export function CartItemControls({
  cartItemId,
  quantity,
  stockQuantity,
}: CartItemControlsProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function updateQuantity(newQuantity: number) {
    setError("");

    if (newQuantity < 1) return;

    if (newQuantity > stockQuantity) {
      setError(`Only ${stockQuantity} available.`);
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateCartItemAction(
        cartItemId,
        newQuantity,
      );

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Update cart quantity error:", error);
      setError("Unable to update quantity.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemove() {
    if (!window.confirm("Remove this product from your cart?")) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const result = await removeCartItemAction(cartItemId);

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Remove cart item error:", error);
      setError("Unable to remove product.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center rounded-lg border border-[#e6ded2] bg-white p-1">
          <button
            type="button"
            onClick={() => updateQuantity(quantity - 1)}
            disabled={isLoading || quantity <= 1}
            aria-label="Decrease quantity"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#453326] transition-all duration-200 hover:bg-[#eee8de] active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            −
          </button>

          <span
            aria-label={`Quantity ${quantity}`}
            aria-live="polite"
            className="min-w-8 px-1 text-center text-sm font-medium tabular-nums"
          >
            {isLoading ? "…" : quantity}
          </span>

          <button
            type="button"
            onClick={() => updateQuantity(quantity + 1)}
            disabled={isLoading || quantity >= stockQuantity}
            aria-label="Increase quantity"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#453326] transition-all duration-200 hover:bg-[#eee8de] active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleRemove}
          disabled={isLoading}
          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? "Processing..." : "Remove"}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
