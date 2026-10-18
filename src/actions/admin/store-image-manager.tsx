"use client";

import {
  ChangeEvent,
  useState,
} from "react";

import {
  deleteStoreImageAction,
  uploadStoreImageAction,
  type StoreImageType,
} from "@/actions/admin/store-images";

type StoreImageManagerProps = {
  type: StoreImageType;
  label: string;
  description: string;
  currentUrl: string | null;
  recommendedSize: string;
};

export function StoreImageManager({
  type,
  label,
  description,
  currentUrl,
  recommendedSize,
}: StoreImageManagerProps) {
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(
      currentUrl,
    );

  const [isUploading, setIsUploading] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ?? null;

    setError("");
    setMessage("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    const objectUrl =
      URL.createObjectURL(file);

    setPreviewUrl(objectUrl);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError(
        "Please select an image first.",
      );
      return;
    }

    setError("");
    setMessage("");
    setIsUploading(true);

    try {
      const formData = new FormData();

      formData.append(
        "file",
        selectedFile,
      );

      const result =
        await uploadStoreImageAction(
          type,
          formData,
        );

      if (!result.success || !result.image) {
        setError(result.message);
        return;
      }

      setPreviewUrl(
        result.image.url,
      );

      setSelectedFile(null);

      setMessage(result.message);

      const input =
        document.getElementById(
          `store-image-${type}`,
        ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }
    } catch (uploadError) {
      console.error(
        "Store image upload error:",
        uploadError,
      );

      setError(
        "Unable to upload image. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete() {
    if (!previewUrl) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete the current ${label.toLowerCase()}? This cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setIsDeleting(true);

    try {
      const result =
        await deleteStoreImageAction(
          type,
        );

      if (!result.success) {
        setError(result.message);
        return;
      }

      setPreviewUrl(null);
      setSelectedFile(null);

      const input =
        document.getElementById(
          `store-image-${type}`,
        ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }

      setMessage(result.message);
    } catch (deleteError) {
      console.error(
        "Store image delete error:",
        deleteError,
      );

      setError(
        "Unable to delete image. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="rounded-xl border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {label}
        </h2>

        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Recommended: {recommendedSize}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        {/* Preview */}

        <div>
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border bg-muted">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={`${label} preview`}
                className="h-full w-full object-contain p-4"
              />
            ) : (
              <div className="px-4 text-center text-sm text-muted-foreground">
                No {label.toLowerCase()} uploaded
              </div>
            )}
          </div>
        </div>

        {/* Controls */}

        <div className="space-y-5">
          <div>
            <label
              htmlFor={`store-image-${type}`}
              className="text-sm font-medium"
            >
              Select image
            </label>

            <input
              id={`store-image-${type}`}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={
                isUploading ||
                isDeleting
              }
              className="mt-2 block w-full text-sm"
            />

            <p className="mt-2 text-xs text-muted-foreground">
              JPG, PNG, or WebP. Maximum
              10 MB.
            </p>
          </div>

          {selectedFile && (
            <div className="rounded-md bg-muted px-4 py-3">
              <p className="text-sm font-medium">
                Selected image
              </p>

              <p className="mt-1 truncate text-sm text-muted-foreground">
                {selectedFile.name}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {(
                  selectedFile.size /
                  1024 /
                  1024
                ).toFixed(2)}{" "}
                MB
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleUpload}
              disabled={
                !selectedFile ||
                isUploading ||
                isDeleting
              }
              className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading
                ? "Uploading..."
                : "Upload Image"}
            </button>

            {previewUrl && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={
                  isUploading ||
                  isDeleting
                }
                className="inline-flex h-10 items-center justify-center rounded-md border border-destructive/30 px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting
                  ? "Deleting..."
                  : "Delete Image"}
              </button>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="status"
              className="rounded-md border px-4 py-3 text-sm"
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}