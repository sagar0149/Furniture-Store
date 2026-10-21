
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { updateProductAction } from "@/actions/products/update";
import { ProductImageManager } from "@/components/admin/product-image-manager";

type CategoryOption = {
  id: string;
  name: string;
};

type ProductImage = {
  id: string;
  url: string;
  publicId: string;
  altText: string | null;
  isPrimary: boolean;
  displayOrder: number;
};

type ProductEditData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  brand: string;
  categoryId: string;
  regularPrice: string;
  salePrice: string;
  stockQuantity: number;
  lowStockThreshold: number;
  material: string;
  color: string;
  dimensions: string;
  weight: string;
  assemblyInformation: string;
  shippingInformation: string;
  returnInformation: string;
  isFeatured: boolean;
  isActive: boolean;
};

type ProductEditFormProps = {
  categories: CategoryOption[];
  initialData: ProductEditData;
  images: ProductImage[];
};

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60";

const textareaClass =
  "w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60";

const labelClass =
  "block text-xs font-bold uppercase tracking-wider text-slate-600";

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-sm font-extrabold text-cyan-700">
        {number}
      </span>
      <div>
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export function ProductEditForm({
  categories,
  initialData,
  images,
}: ProductEditFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData.name);
  const [slug, setSlug] = useState(initialData.slug);
  const [description, setDescription] = useState(initialData.description);
  const [sku, setSku] = useState(initialData.sku);
  const [brand, setBrand] = useState(initialData.brand);
  const [categoryId, setCategoryId] = useState(initialData.categoryId);
  const [regularPrice, setRegularPrice] = useState(initialData.regularPrice);
  const [salePrice, setSalePrice] = useState(initialData.salePrice);
  const [stockQuantity, setStockQuantity] = useState(
    String(initialData.stockQuantity),
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    String(initialData.lowStockThreshold),
  );
  const [material, setMaterial] = useState(initialData.material);
  const [color, setColor] = useState(initialData.color);
  const [dimensions, setDimensions] = useState(initialData.dimensions);
  const [weight, setWeight] = useState(initialData.weight);
  const [assemblyInformation, setAssemblyInformation] = useState(
    initialData.assemblyInformation,
  );
  const [shippingInformation, setShippingInformation] = useState(
    initialData.shippingInformation,
  );
  const [returnInformation, setReturnInformation] = useState(
    initialData.returnInformation,
  );
  const [isFeatured, setIsFeatured] = useState(initialData.isFeatured);
  const [isActive, setIsActive] = useState(initialData.isActive);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !slug.trim() || !sku.trim() || !description.trim()) {
      setError("Please complete all required product fields.");
      return;
    }

    const parsedStock = Number(stockQuantity);
    const parsedThreshold = Number(lowStockThreshold);
    const parsedRegularPrice = Number(regularPrice);
    const parsedSalePrice =
      salePrice.trim() === "" ? null : Number(salePrice);
    const parsedWeight = weight.trim() === "" ? null : Number(weight);

    if (
      !Number.isSafeInteger(parsedStock) ||
      parsedStock < 0 ||
      !Number.isSafeInteger(parsedThreshold) ||
      parsedThreshold < 0
    ) {
      setError("Stock quantity and low-stock threshold must be non-negative whole numbers.");
      return;
    }

    if (!Number.isFinite(parsedRegularPrice) || parsedRegularPrice < 0) {
      setError("Enter a valid, non-negative regular price.");
      return;
    }

    if (
      parsedSalePrice !== null &&
      (!Number.isFinite(parsedSalePrice) || parsedSalePrice < 0)
    ) {
      setError("Enter a valid, non-negative sale price.");
      return;
    }

    if (parsedWeight !== null && (!Number.isFinite(parsedWeight) || parsedWeight < 0)) {
      setError("Enter a valid, non-negative product weight.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateProductAction({
        id: initialData.id,
        name,
        slug,
        description,
        sku,
        brand,
        categoryId,
        regularPrice,
        salePrice,
        stockQuantity: parsedStock,
        lowStockThreshold: parsedThreshold,
        material,
        color,
        dimensions,
        weight,
        assemblyInformation,
        shippingInformation,
        returnInformation,
        isFeatured,
        isActive,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Update product error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <SectionHeading
          number="01"
          title="Basic Information"
          description="Product identity, description, and catalog organization."
        />

        <div className="grid gap-5">
          <div className="space-y-2">
            <label htmlFor="name" className={labelClass}>
              Product name <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              disabled={isLoading}
              maxLength={200}
              className={inputClass}
              placeholder="Enter product name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className={labelClass}>
              URL slug <span className="text-rose-500">*</span>
            </label>
            <input
              id="slug"
              value={slug}
              onChange={(event) => setSlug(generateSlug(event.target.value))}
              required
              disabled={isLoading}
              className={`${inputClass} font-mono`}
              placeholder="product-url-slug"
            />
            <p className="text-xs leading-5 text-slate-400">
              Used in the product URL. Editing this value may change the
              product's public URL.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className={labelClass}>
              Product description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              required
              disabled={isLoading}
              className={textareaClass}
              placeholder="Describe the product, its design, and its key features..."
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="sku" className={labelClass}>
                SKU <span className="text-rose-500">*</span>
              </label>
              <input
                id="sku"
                value={sku}
                onChange={(event) => setSku(event.target.value.toUpperCase())}
                required
                disabled={isLoading}
                className={`${inputClass} font-mono`}
                placeholder="FURN-001"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="brand" className={labelClass}>
                Brand
              </label>
              <input
                id="brand"
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                disabled={isLoading}
                className={inputClass}
                placeholder="Enter brand name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="categoryId" className={labelClass}>
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="categoryId"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
              disabled={isLoading}
              className={inputClass}
            >
              {categories.length === 0 && (
                <option value="">No categories available</option>
              )}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Pricing and Inventory */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <SectionHeading
          number="02"
          title="Pricing & Inventory"
          description="Set product prices and monitor available stock."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="regularPrice" className={labelClass}>
              Regular price <span className="text-rose-500">*</span>
            </label>
            <input
              id="regularPrice"
              type="number"
              min="0"
              step="0.01"
              value={regularPrice}
              onChange={(event) => setRegularPrice(event.target.value)}
              required
              disabled={isLoading}
              className={inputClass}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="salePrice" className={labelClass}>
              Sale price
            </label>
            <input
              id="salePrice"
              type="number"
              min="0"
              step="0.01"
              value={salePrice}
              onChange={(event) => setSalePrice(event.target.value)}
              disabled={isLoading}
              className={inputClass}
              placeholder="Leave empty for no sale"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="stockQuantity" className={labelClass}>
              Stock quantity <span className="text-rose-500">*</span>
            </label>
            <input
              id="stockQuantity"
              type="number"
              min="0"
              step="1"
              value={stockQuantity}
              onChange={(event) => setStockQuantity(event.target.value)}
              required
              disabled={isLoading}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="lowStockThreshold" className={labelClass}>
              Low-stock threshold <span className="text-rose-500">*</span>
            </label>
            <input
              id="lowStockThreshold"
              type="number"
              min="0"
              step="1"
              value={lowStockThreshold}
              onChange={(event) => setLowStockThreshold(event.target.value)}
              required
              disabled={isLoading}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50/70 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-cyan-700 shadow-sm">
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
                  d="M12 8v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z"
                />
              </svg>
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Inventory management
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Stock values entered here are submitted through your existing
                product update action. For day-to-day stock movements, use the
                Inventory page to record audited adjustments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <SectionHeading
          number="03"
          title="Specifications"
          description="Describe the materials, dimensions, and physical properties."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="material" className={labelClass}>
              Material
            </label>
            <input
              id="material"
              value={material}
              onChange={(event) => setMaterial(event.target.value)}
              disabled={isLoading}
              className={inputClass}
              placeholder="e.g. Solid oak wood"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="color" className={labelClass}>
              Color
            </label>
            <input
              id="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              disabled={isLoading}
              className={inputClass}
              placeholder="e.g. Walnut brown"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dimensions" className={labelClass}>
              Dimensions
            </label>
            <input
              id="dimensions"
              value={dimensions}
              onChange={(event) => setDimensions(event.target.value)}
              disabled={isLoading}
              className={inputClass}
              placeholder="e.g. 120 × 80 × 75 cm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="weight" className={labelClass}>
              Weight
            </label>
            <input
              id="weight"
              type="number"
              min="0"
              step="0.01"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              disabled={isLoading}
              className={inputClass}
              placeholder="Weight in your chosen unit"
            />
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <SectionHeading
          number="04"
          title="Additional Information"
          description="Provide helpful assembly, delivery, and return details."
        />

        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="assemblyInformation" className={labelClass}>
              Assembly information
            </label>
            <textarea
              id="assemblyInformation"
              value={assemblyInformation}
              onChange={(event) => setAssemblyInformation(event.target.value)}
              rows={3}
              disabled={isLoading}
              className={textareaClass}
              placeholder="Assembly instructions or requirements..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="shippingInformation" className={labelClass}>
              Shipping information
            </label>
            <textarea
              id="shippingInformation"
              value={shippingInformation}
              onChange={(event) => setShippingInformation(event.target.value)}
              rows={3}
              disabled={isLoading}
              className={textareaClass}
              placeholder="Shipping and delivery information..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="returnInformation" className={labelClass}>
              Return information
            </label>
            <textarea
              id="returnInformation"
              value={returnInformation}
              onChange={(event) => setReturnInformation(event.target.value)}
              rows={3}
              disabled={isLoading}
              className={textareaClass}
              placeholder="Return policy information for this product..."
            />
          </div>
        </div>
      </section>

      {/* Product Images */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <SectionHeading
          number="05"
          title="Product Images"
          description="Manage the images displayed in your storefront."
        />

        <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
          <p className="text-sm font-semibold text-indigo-950">
            Image management
          </p>
          <p className="mt-1 text-xs leading-5 text-indigo-800">
            Manage product images, alternative text, and primary image settings
            using the existing image manager below.
          </p>
        </div>

        <ProductImageManager
          productId={initialData.id}
          productName={initialData.name}
          initialImages={images}
        />
      </section>

      {/* Visibility */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <SectionHeading
          number="06"
          title="Visibility & Promotion"
          description="Control whether the product is active and featured."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-cyan-300 hover:bg-cyan-50/40">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              disabled={isLoading}
              className="mt-1 h-4 w-4 accent-cyan-600 focus-visible:ring-2 focus-visible:ring-cyan-500"
            />
            <span>
              <span className="block text-sm font-bold text-slate-900">
                Active product
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Allow this product to appear in your storefront.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-violet-300 hover:bg-violet-50/40">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(event) => setIsFeatured(event.target.checked)}
              disabled={isLoading}
              className="mt-1 h-4 w-4 accent-violet-600 focus-visible:ring-2 focus-visible:ring-violet-500"
            />
            <span>
              <span className="block text-sm font-bold text-slate-900">
                Featured product
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Mark this product as featured for eligible storefront sections.
              </span>
            </span>
          </label>
        </div>
      </section>

      {/* Error feedback */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 font-bold">
            !
          </span>
          <div>
            <p className="font-bold">Unable to save product</p>
            <p className="mt-1 leading-5">{error}</p>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="sticky bottom-3 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-900/10 backdrop-blur-md sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-900">
              Ready to save your changes?
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Review your product details before submitting.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              disabled={isLoading}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition-all hover:-translate-y-0.5 hover:from-cyan-500 hover:to-blue-500 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Saving changes...
                </>
              ) : (
                <>
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
                      d="m5 12 4 4L19 6"
                    />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
