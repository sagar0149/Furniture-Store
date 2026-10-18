"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteCategoryAction } from "@/actions/categories/delete";

type CategoryDeleteButtonProps = {
  id: string;
  name: string;
};

export function CategoryDeleteButton({
  id,
  name,
}: CategoryDeleteButtonProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const result =
        await deleteCategoryAction(id);

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Delete category error:",
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
        onClick={handleDelete}
        disabled={isLoading}
        className="text-sm font-medium text-destructive underline underline-offset-4 hover:no-underline disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading
          ? "Deleting..."
          : "Delete"}
      </button>

      {error && (
        <p className="max-w-48 text-right text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}