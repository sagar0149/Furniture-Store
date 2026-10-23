"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updateCartQuantityAction } from "@/actions/cart/update";
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

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function updateQuantity(
    newQuantity: number,
  ) {
    setError("");

    if (newQuantity < 1) {
      return;
    }

    if (newQuantity > stockQuantity) {
      setError(
        `Only ${stockQuantity} available.`,
      );
      return;
    }

    setIsLoading(true);

    try {
      const result =
        await updateCartQuantityAction(
          cartItemId,
          newQuantity,
        );

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Update cart quantity error:",
        error,
      );

      setError(
        "Unable to update quantity.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemove() {
    const confirmed =
      window.confirm(
        "Remove this product from your cart?",
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const result =
        await removeCartItemAction(
          cartItemId,
        );

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Remove cart item error:",
        error,
      );

      setError(
        "Unable to remove product.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() =>
            updateQuantity(quantity - 1)
          }
          disabled={
            isLoading ||
            quantity <= 1
          }
          aria-label="Decrease quantity"
          className="flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>

        <span
          aria-label={`Quantity ${quantity}`}
          className="flex h-9 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-medium"
        >
          {quantity}
        </span>

        <button
          type="button"
          onClick={() =>
            updateQuantity(quantity + 1)
          }
          disabled={
            isLoading ||
            quantity >= stockQuantity
          }
          aria-label="Increase quantity"
          className="flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>

        <button
          type="button"
          onClick={handleRemove}
          disabled={isLoading}
          className="ml-2 h-9 rounded-md border border-destructive/30 px-3 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading
            ? "Processing..."
            : "Remove"}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}

