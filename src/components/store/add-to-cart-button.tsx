"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { addToCartAction } from "@/actions/cart/add";

type AddToCartButtonProps = {
  productId: string;
  stockQuantity: number;
};

export function AddToCartButton({
  productId,
  stockQuantity,
}: AddToCartButtonProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleAddToCart() {
    setMessage("");
    setError("");

    if (stockQuantity <= 0) {
      setError(
        "This product is currently out of stock.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const result =
        await addToCartAction(productId, 1);

      if (!result.success) {
        setError(result.message);
        return;
      }

      setMessage(result.message);

      router.refresh();
    } catch (error) {
      console.error(
        "Add to cart error:",
        error,
      );

      setError(
        "Unable to add product to cart. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={
          isLoading ||
          stockQuantity <= 0
        }
        className="inline-flex h-12 w-full items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading
          ? "Adding..."
          : stockQuantity <= 0
            ? "Out of Stock"
            : "Add to Cart"}
      </button>

      {error && (
        <p
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="text-sm text-green-600"
        >
          {message}
        </p>
      )}
    </div>
  );
}