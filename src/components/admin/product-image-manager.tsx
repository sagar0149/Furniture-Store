"use client";

import {
  ChangeEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  deleteProductImageAction,
  setPrimaryProductImageAction,
  uploadProductImageAction,
} from "@/actions/products/images";

type ProductImage = {
  id: string;
  url: string;
  publicId: string;
  altText: string | null;
  isPrimary: boolean;
  displayOrder: number;
};

type ProductImageManagerProps = {
  productId: string;
  productName: string;
  initialImages: ProductImage[];
};

export function ProductImageManager({
  productId,
  productName,
  initialImages,
}: ProductImageManagerProps) {
  const router = useRouter();

  const [images, setImages] =
    useState<ProductImage[]>(initialImages);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [altText, setAltText] =
    useState(productName);

  const [isUploading, setIsUploading] =
    useState(false);

  const [processingImageId, setProcessingImageId] =
    useState<string | null>(null);

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

      formData.append(
        "altText",
        altText.trim() || productName,
      );

      const result =
        await uploadProductImageAction(
          productId,
          formData,
        );

      if (!result.success || !result.image) {
        setError(result.message);
        return;
      }

      setImages((current) => [
        ...current,
        result.image!,
      ]);

      setSelectedFile(null);

      setMessage(result.message);

      const input =
        document.getElementById(
          "product-image-file",
        ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Image upload error:",
        error,
      );

      setError(
        "Unable to upload image. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSetPrimary(
    imageId: string,
  ) {
    setError("");
    setMessage("");
    setProcessingImageId(imageId);

    try {
      const result =
        await setPrimaryProductImageAction(
          productId,
          imageId,
        );

      if (!result.success) {
        setError(result.message);
        return;
      }

      setImages((current) =>
        current.map((image) => ({
          ...image,
          isPrimary:
            image.id === imageId,
        })),
      );

      setMessage(result.message);

      router.refresh();
    } catch (error) {
      console.error(
        "Set primary image error:",
        error,
      );

      setError(
        "Unable to update primary image.",
      );
    } finally {
      setProcessingImageId(null);
    }
  }

  async function handleDelete(
    image: ProductImage,
  ) {
    const confirmed =
      window.confirm(
        "Delete this product image? This cannot be undone.",
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setProcessingImageId(image.id);

    try {
      const result =
        await deleteProductImageAction(
          productId,
          image.id,
        );

      if (!result.success) {
        setError(result.message);
        return;
      }

      setImages((current) =>
        current.filter(
          (item) =>
            item.id !== image.id,
        ),
      );

      setMessage(result.message);

      router.refresh();
    } catch (error) {
      console.error(
        "Delete image error:",
        error,
      );

      setError(
        "Unable to delete image.",
      );
    } finally {
      setProcessingImageId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload section */}

      <div className="rounded-lg border border-dashed p-5">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="product-image-file"
              className="text-sm font-medium"
            >
              Select image
            </label>

            <input
              id="product-image-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={isUploading}
              className="mt-2 block w-full text-sm"
            />

            <p className="mt-2 text-xs text-muted-foreground">
              JPG, PNG, or WebP. Maximum 10 MB.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="product-image-alt"
              className="text-sm font-medium"
            >
              Alt text
            </label>

            <input
              id="product-image-alt"
              type="text"
              value={altText}
              onChange={(event) =>
                setAltText(
                  event.target.value,
                )
              }
              disabled={isUploading}
              maxLength={255}
              placeholder={productName}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {selectedFile && (
            <div className="rounded-md bg-muted px-3 py-2 text-sm">
              <p className="font-medium">
                Selected:
              </p>

              <p className="truncate text-muted-foreground">
                {selectedFile.name}
              </p>

              <p className="text-xs text-muted-foreground">
                {(
                  selectedFile.size /
                  1024 /
                  1024
                ).toFixed(2)}{" "}
                MB
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={
              isUploading ||
              !selectedFile
            }
            className="h-10 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading
              ? "Uploading..."
              : "Upload Image"}
          </button>
        </div>
      </div>

      {/* Error message */}

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Success message */}

      {message && (
        <div
          role="status"
          className="rounded-md border px-4 py-3 text-sm"
        >
          {message}
        </div>
      )}

      {/* Existing images */}

      {images.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No product images yet.
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Upload the first image to automatically
            make it the primary image.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => {
            const processing =
              processingImageId ===
              image.id;

            return (
              <div
                key={image.id}
                className="overflow-hidden rounded-lg border"
              >
                <div className="aspect-square bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={
                      image.altText ||
                      productName
                    }
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted-foreground">
                      Image{" "}
                      {image.displayOrder + 1}
                    </span>

                    {image.isPrimary && (
                      <span className="shrink-0 rounded-full border px-2 py-1 text-xs font-medium">
                        Primary
                      </span>
                    )}
                  </div>

                  <p className="truncate text-xs text-muted-foreground">
                    {image.altText ||
                      productName}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {!image.isPrimary && (
                      <button
                        type="button"
                        onClick={() =>
                          handleSetPrimary(
                            image.id,
                          )
                        }
                        disabled={
                          processing
                        }
                        className="h-9 rounded-md border px-3 text-xs font-medium hover:bg-muted disabled:opacity-50"
                      >
                        {processing
                          ? "Updating..."
                          : "Set Primary"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(image)
                      }
                      disabled={
                        processing
                      }
                      className="h-9 rounded-md border border-destructive/30 px-3 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                      {processing
                        ? "Processing..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}