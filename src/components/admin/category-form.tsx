
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createCategoryAction } from "@/actions/categories/create";
import { updateCategoryAction } from "@/actions/categories/update";

type CategoryOption = {
  id: string;
  name: string;
};

type CategoryFormData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  parentId: string;
  displayOrder: number;
  isActive: boolean;
};

type CategoryFormProps = {
  categories: CategoryOption[];
  initialData?: CategoryFormData;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function CategoryForm({
  categories,
  initialData,
}: CategoryFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [imageUrl, setImageUrl] = useState(
    initialData?.imageUrl ?? "",
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [parentId, setParentId] = useState(
    initialData?.parentId ?? "",
  );
  const [displayOrder, setDisplayOrder] = useState(
    String(initialData?.displayOrder ?? 0),
  );
  const [isActive, setIsActive] = useState(
    initialData?.isActive ?? true,
  );

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleNameChange(value: string) {
    setName(value);

    if (!isEditMode && !slug) {
      setSlug(generateSlug(value));
    }
  }

  function handleFileChange(file: File | undefined) {
    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, and WebP images are allowed.");
      return;
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      setError("Choose an image smaller than or equal to 10 MB.");
      return;
    }

    setSelectedFile(file);
  }

  async function uploadCategoryImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/categories/image", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success || !result.url) {
      throw new Error(result.error ?? "Image upload failed.");
    }

    return result.url as string;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Upload a newly selected image before saving the category.
      const finalImageUrl = selectedFile
        ? await uploadCategoryImage(selectedFile)
        : imageUrl;

      if (isEditMode && initialData?.id) {
        const result = await updateCategoryAction({
          id: initialData.id,
          name,
          slug,
          description,
          imageUrl: finalImageUrl,
          parentId,
          displayOrder: Number(displayOrder),
          isActive,
        });

        if (!result.success) {
          setError(result.message);
          return;
        }
      } else {
        const result = await createCategoryAction({
          name,
          slug,
          description,
          imageUrl: finalImageUrl,
          parentId,
          displayOrder: Number(displayOrder),
        });

        if (!result.success) {
          setError(result.message);
          return;
        }
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      console.error("Category form error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const displayedImage = previewUrl || imageUrl;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border p-6">
        <div className="space-y-5">
          {/* Category name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Category name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="Living Room"
              required
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium">
              Slug
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(event) =>
                setSlug(generateSlug(event.target.value))
              }
              placeholder="living-room"
              required
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              Used in the category URL.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe this category..."
              rows={4}
              disabled={isLoading}
              className="w-full resize-none rounded-md border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          {/* Direct image upload */}
          <div className="space-y-3">
            <label htmlFor="categoryImage" className="text-sm font-medium">
              Category image
            </label>

            {displayedImage && (
              <div className="relative w-full max-w-xs overflow-hidden rounded-lg border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayedImage}
                  alt="Category image preview"
                  className="h-48 w-full object-contain"
                />
              </div>
            )}

            <input
              id="categoryImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isLoading}
              onChange={(event) => {
                handleFileChange(event.target.files?.[0]);
                // Allow selecting the same file again.
                event.target.value = "";
              }}
              className="block w-full cursor-pointer rounded-md border p-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-4 file:py-2 file:text-sm file:font-medium"
            />

            <p className="text-xs text-muted-foreground">
              Select an image from your computer. JPG, PNG, or WebP;
              maximum size 10 MB.
            </p>

            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name}
              </p>
            )}

            {imageUrl && !selectedFile && (
              <p className="text-xs text-muted-foreground">
                Current image is saved. Select another file to replace it.
              </p>
            )}

            {selectedFile && (
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                disabled={isLoading}
                className="text-sm underline underline-offset-4 disabled:opacity-50"
              >
                Cancel image replacement
              </button>
            )}
          </div>

          {/* Parent category */}
          <div className="space-y-2">
            <label htmlFor="parentId" className="text-sm font-medium">
              Parent category
            </label>
            <select
              id="parentId"
              value={parentId}
              onChange={(event) => setParentId(event.target.value)}
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              <option value="">No parent category</option>
              {categories
                .filter((category) => category.id !== initialData?.id)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Display order */}
          <div className="space-y-2">
            <label htmlFor="displayOrder" className="text-sm font-medium">
              Display order
            </label>
            <input
              id="displayOrder"
              type="number"
              min="0"
              value={displayOrder}
              onChange={(event) => setDisplayOrder(event.target.value)}
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          {/* Category status */}
          {isEditMode && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Category status</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Control whether this category is visible in the store.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4"
                />
                <span className="text-sm">
                  {isActive ? "Active" : "Inactive"}
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          disabled={isLoading}
          className="h-10 rounded-md border px-4 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="h-10 rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading
            ? selectedFile
              ? "Uploading image..."
              : isEditMode
                ? "Saving..."
                : "Creating..."
            : isEditMode
              ? "Save Changes"
              : "Create Category"}
        </button>
      </div>
    </form>
  );
}
