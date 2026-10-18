"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { toggleCategoryStatusAction } from "@/actions/categories/toggle-status";

type CategoryStatusButtonProps = {
  id: string;
  isActive: boolean;
};

export function CategoryStatusButton({
  id,
  isActive,
}: CategoryStatusButtonProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleToggle() {
    setError("");
    setIsLoading(true);

    try {
      const result =
        await toggleCategoryStatusAction(id);

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Toggle category status error:",
        error,
      );

      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        className="text-sm font-medium underline underline-offset-4 hover:no-underline disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading
          ? "Updating..."
          : isActive
            ? "Deactivate"
            : "Activate"}
      </button>

      {error && (
        <p className="max-w-40 text-right text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}