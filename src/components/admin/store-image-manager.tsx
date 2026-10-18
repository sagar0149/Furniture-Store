"use client";

import {
  ChangeEvent,
  useState,
} from "react";

type StoreImageType =
  | "logo"
  | "favicon"
  | "ogImage";

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
    useState<string | null>(currentUrl);

  const [uploading, setUploading] =
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

    setMessage("");
    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSelectedFile(null);
      setError(
        "Please select a valid image file.",
      );
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

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();

      formData.append(
        "file",
        selectedFile,
      );

      formData.append("type", type);

      const response = await fetch(
        "/api/admin/settings/store-image",
        {
          method: "POST",
          body: formData,
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "Unable to upload image.",
        );
      }

      if (data.url) {
        setPreviewUrl(data.url);
      }

      setSelectedFile(null);

      const input =
        document.getElementById(
          `store-image-${type}`,
        ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }

      setMessage(
        `${label} uploaded successfully.`,
      );
    } catch (err) {
      console.error(
        "Store image upload error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload image.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-xl border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {label}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          Recommended size:{" "}
          {recommendedSize}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        {/* Preview */}

        <div>
          <p className="mb-2 text-sm font-medium">
            Preview
          </p>

          <div
            className={[
              "flex aspect-square items-center justify-center overflow-hidden rounded-lg border bg-muted",
              type === "ogImage"
                ? "md:aspect-[1.91/1]"
                : "",
            ].join(" ")}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={`${label} preview`}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="px-4 text-center text-sm text-muted-foreground">
                No image uploaded
              </div>
            )}
          </div>
        </div>

        {/* Upload */}

        <div className="flex flex-col justify-center">
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
            disabled={uploading}
            className="mt-2 block w-full text-sm"
          />

          <p className="mt-2 text-xs text-muted-foreground">
            JPG, PNG, or WebP images are
            supported.
          </p>

          {selectedFile && (
            <div className="mt-4 rounded-md bg-muted px-3 py-3">
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

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="status"
              className="mt-4 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm"
            >
              {message}
            </div>
          )}

          <div className="mt-5">
            <button
              type="button"
              onClick={handleUpload}
              disabled={
                uploading ||
                !selectedFile
              }
              className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading
                ? "Uploading..."
                : `Upload ${label}`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}