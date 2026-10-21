
"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
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

    if (!file) return;

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

  function cancelImageSelection() {
    setSelectedFile(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
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

  const inputClass =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60";

  const textAreaClass =
    "w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60";

  const labelClass = "block text-sm font-semibold text-slate-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic category information */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-white to-cyan-50/50 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 7.8 7.5 4.4 7.5-4.4"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Basic Information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Set the category name and URL details.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          <div className="space-y-2">
            <label htmlFor="name" className={labelClass}>
              Category name <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="e.g. Living Room"
              required
              disabled={isLoading}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className={labelClass}>
              URL slug <span className="text-rose-500">*</span>
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
              className={inputClass}
            />
            <p className="text-xs leading-5 text-slate-500">
              Used in the category URL. Use lowercase letters, numbers, and
              hyphens.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe this category and the products it contains..."
              rows={4}
              disabled={isLoading}
              className={textAreaClass}
            />
            <p className="text-xs text-slate-500">
              A short description helps administrators and shoppers understand
              this category.
            </p>
          </div>
        </div>
      </section>

      {/* Highly visible category image uploader */}
      <section className="overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-sm">
        <div className="border-b border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-blue-50 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16V4m0 0L7 9m5-5 5 5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-slate-900">
                Category Image
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Upload a clear image to visually identify this category.
              </p>
            </div>

            <span className="hidden rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-bold text-cyan-800 sm:inline-flex">
              Optional
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-7">
          {displayedImage ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white sm:w-48">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayedImage}
                    alt="Category image preview"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {selectedFile ? "New image selected" : "Current image"}
                  </span>

                  <h3 className="mt-3 font-bold text-slate-900">
                    {selectedFile ? selectedFile.name : "Category image"}
                  </h3>

                  <p className="mt-1 break-words text-sm text-slate-500">
                    {selectedFile
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload when you save`
                      : "Your saved category image"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-cyan-600/20 transition-all hover:-translate-y-0.5 hover:from-cyan-500 hover:to-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 16V4m0 0L7 9m5-5 5 5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
                        />
                      </svg>
                      Replace Image
                    </button>

                    {selectedFile && (
                      <button
                        type="button"
                        onClick={cancelImageSelection}
                        disabled={isLoading}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
                      >
                        Cancel replacement
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="group flex min-h-64 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-300 bg-gradient-to-b from-cyan-50/80 to-blue-50/40 px-5 py-8 text-center transition-all hover:border-cyan-500 hover:from-cyan-50 hover:to-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-100 bg-white text-cyan-700 shadow-md shadow-cyan-900/5 transition-transform group-hover:-translate-y-1">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-8 w-8"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16V4m0 0L7 9m5-5 5 5"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
                  />
                </svg>
              </span>

              <span className="mt-5 text-lg font-bold text-slate-900">
                Upload Category Image
              </span>

              <span className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                Click here to browse your computer and choose an image for
                this category.
              </span>

              <span className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition-all group-hover:from-cyan-500 group-hover:to-blue-500">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 15-5-5L5 21"
                  />
                </svg>
                Choose Image
              </span>

              <span className="mt-4 text-xs font-medium text-slate-500">
                JPG, PNG or WebP · Maximum file size 10 MB
              </span>
            </button>
          )}

          {/* Keep the native file input functional but visually hidden. */}
          <input
            ref={fileInputRef}
            id="categoryImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isLoading}
            onChange={(event) => {
              handleFileChange(event.target.files?.[0]);
              event.target.value = "";
            }}
            className="sr-only"
          />

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 11v5m0-8h.01"
              />
            </svg>

            <div>
              <p className="text-sm font-semibold text-blue-900">
                Image upload tips
              </p>
              <p className="mt-1 text-xs leading-5 text-blue-800">
                Use a clear, well-lit image. Supported formats are JPG, PNG,
                and WebP. Maximum size is 10 MB. A newly selected image is
                uploaded when you save the category.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category organization */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-white to-indigo-50/40 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h10"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Organization
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Control category hierarchy and display order.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
          <div className="space-y-2">
            <label htmlFor="parentId" className={labelClass}>
              Parent category
            </label>
            <select
              id="parentId"
              value={parentId}
              onChange={(event) => setParentId(event.target.value)}
              disabled={isLoading}
              className={inputClass}
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
            <p className="text-xs leading-5 text-slate-500">
              Optionally place this category under another category.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="displayOrder" className={labelClass}>
              Display order
            </label>
            <input
              id="displayOrder"
              type="number"
              min="0"
              step="1"
              value={displayOrder}
              onChange={(event) => setDisplayOrder(event.target.value)}
              disabled={isLoading}
              className={inputClass}
            />
            <p className="text-xs leading-5 text-slate-500">
              A smaller number generally places the category earlier.
            </p>
          </div>

          {isEditMode && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isActive ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    <p className="text-sm font-bold text-slate-900">
                      Category visibility
                    </p>
                  </div>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {isActive
                      ? "This category is marked active."
                      : "This category is marked inactive."}
                  </p>
                </div>

                <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                    disabled={isLoading}
                    className="h-5 w-5 rounded border-slate-300 accent-cyan-600 focus:ring-2 focus:ring-cyan-500/20"
                  />
                  <span
                    className={`text-sm font-bold ${
                      isActive ? "text-emerald-700" : "text-slate-600"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Errors */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v5m0 3h.01"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Prominent action bar */}
      <div className="sticky bottom-3 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-900/10 backdrop-blur sm:p-5">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="hidden text-xs text-slate-500 sm:block">
            {isEditMode
              ? "Review your changes before saving."
              : "Complete the required details to create your category."}
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/admin/categories")}
              disabled={isLoading}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition-all hover:-translate-y-0.5 hover:from-cyan-500 hover:to-blue-500 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  {selectedFile ? "Uploading image..." : "Saving..."}
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m5 12 4 4L19 6"
                    />
                  </svg>
                  {isEditMode ? "Save Changes" : "Create Category"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
