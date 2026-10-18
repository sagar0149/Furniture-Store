"use client";

import { FormEvent, useState } from "react";
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

export function CategoryForm({
  categories,
  initialData,
}: CategoryFormProps) {
  const router = useRouter();

  const isEditMode = Boolean(initialData?.id);

  const [name, setName] = useState(
    initialData?.name ?? "",
  );

  const [slug, setSlug] = useState(
    initialData?.slug ?? "",
  );

  const [description, setDescription] =
    useState(
      initialData?.description ?? "",
    );

  const [imageUrl, setImageUrl] =
    useState(initialData?.imageUrl ?? "");

  const [parentId, setParentId] =
    useState(initialData?.parentId ?? "");

  const [displayOrder, setDisplayOrder] =
    useState(
      String(initialData?.displayOrder ?? 0),
    );

  const [isActive, setIsActive] =
    useState(
      initialData?.isActive ?? true,
    );

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] =
    useState(false);

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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      if (isEditMode && initialData?.id) {
        const result =
          await updateCategoryAction({
            id: initialData.id,
            name,
            slug,
            description,
            imageUrl,
            parentId,
            displayOrder: Number(
              displayOrder,
            ),
            isActive,
          });

        if (!result.success) {
          setError(result.message);
          return;
        }
      } else {
        const result =
          await createCategoryAction({
            name,
            slug,
            description,
            imageUrl,
            parentId,
            displayOrder: Number(
              displayOrder,
            ),
          });

        if (!result.success) {
          setError(result.message);
          return;
        }
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      console.error(
        "Category form error:",
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
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="rounded-xl border p-6">
        <div className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium"
            >
              Category name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                handleNameChange(
                  event.target.value,
                )
              }
              placeholder="Living Room"
              required
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label
              htmlFor="slug"
              className="text-sm font-medium"
            >
              Slug
            </label>

            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(event) =>
                setSlug(
                  generateSlug(
                    event.target.value,
                  ),
                )
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
            <label
              htmlFor="description"
              className="text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Describe this category..."
              rows={4}
              disabled={isLoading}
              className="w-full resize-none rounded-md border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label
              htmlFor="imageUrl"
              className="text-sm font-medium"
            >
              Image URL
            </label>

            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(event) =>
                setImageUrl(
                  event.target.value,
                )
              }
              placeholder="https://..."
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          {/* Parent */}
          <div className="space-y-2">
            <label
              htmlFor="parentId"
              className="text-sm font-medium"
            >
              Parent category
            </label>

            <select
              id="parentId"
              value={parentId}
              onChange={(event) =>
                setParentId(
                  event.target.value,
                )
              }
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              <option value="">
                No parent category
              </option>

              {categories
                .filter(
                  (category) =>
                    category.id !==
                    initialData?.id,
                )
                .map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Display order */}
          <div className="space-y-2">
            <label
              htmlFor="displayOrder"
              className="text-sm font-medium"
            >
              Display order
            </label>

            <input
              id="displayOrder"
              type="number"
              min="0"
              value={displayOrder}
              onChange={(event) =>
                setDisplayOrder(
                  event.target.value,
                )
              }
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          {/* Status */}
          {isEditMode && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">
                  Category status
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Control whether this category is
                  visible in the store.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) =>
                    setIsActive(
                      event.target.checked,
                    )
                  }
                  disabled={isLoading}
                  className="h-4 w-4"
                />

                <span className="text-sm">
                  {isActive
                    ? "Active"
                    : "Inactive"}
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
          onClick={() =>
            router.push("/admin/categories")
          }
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
            ? isEditMode
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