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

export function ProductEditForm({
  categories,
  initialData,
  images,
}: ProductEditFormProps) {
  const router = useRouter();

  const [name, setName] = useState(
    initialData.name,
  );

  const [slug, setSlug] = useState(
    initialData.slug,
  );

  const [description, setDescription] =
    useState(initialData.description);

  const [sku, setSku] = useState(
    initialData.sku,
  );

  const [brand, setBrand] = useState(
    initialData.brand,
  );

  const [categoryId, setCategoryId] =
    useState(initialData.categoryId);

  const [regularPrice, setRegularPrice] =
    useState(initialData.regularPrice);

  const [salePrice, setSalePrice] =
    useState(initialData.salePrice);

  const [stockQuantity, setStockQuantity] =
    useState(
      String(initialData.stockQuantity),
    );

  const [
    lowStockThreshold,
    setLowStockThreshold,
  ] = useState(
    String(initialData.lowStockThreshold),
  );

  const [material, setMaterial] =
    useState(initialData.material);

  const [color, setColor] = useState(
    initialData.color,
  );

  const [dimensions, setDimensions] =
    useState(initialData.dimensions);

  const [weight, setWeight] = useState(
    initialData.weight,
  );

  const [
    assemblyInformation,
    setAssemblyInformation,
  ] = useState(
    initialData.assemblyInformation,
  );

  const [
    shippingInformation,
    setShippingInformation,
  ] = useState(
    initialData.shippingInformation,
  );

  const [
    returnInformation,
    setReturnInformation,
  ] = useState(
    initialData.returnInformation,
  );

  const [isFeatured, setIsFeatured] =
    useState(initialData.isFeatured);

  const [isActive, setIsActive] =
    useState(initialData.isActive);

  const [error, setError] =
    useState("");

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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const result =
        await updateProductAction({
          id: initialData.id,
          name,
          slug,
          description,
          sku,
          brand,
          categoryId,
          regularPrice,
          salePrice,
          stockQuantity:
            Number(stockQuantity),
          lowStockThreshold:
            Number(lowStockThreshold),
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
      console.error(
        "Update product error:",
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
      {/* Basic Information */}

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">
          Basic Information
        </h2>

        <div className="mt-6 grid gap-5">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium"
            >
              Product name
            </label>

            <input
              id="name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="slug"
              className="text-sm font-medium"
            >
              Slug
            </label>

            <input
              id="slug"
              value={slug}
              onChange={(event) =>
                setSlug(
                  generateSlug(
                    event.target.value,
                  ),
                )
              }
              required
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

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
              rows={6}
              required
              disabled={isLoading}
              className="w-full resize-none rounded-md border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="sku"
                className="text-sm font-medium"
              >
                SKU
              </label>

              <input
                id="sku"
                value={sku}
                onChange={(event) =>
                  setSku(
                    event.target.value.toUpperCase(),
                  )
                }
                required
                disabled={isLoading}
                className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="brand"
                className="text-sm font-medium"
              >
                Brand
              </label>

              <input
                id="brand"
                value={brand}
                onChange={(event) =>
                  setBrand(
                    event.target.value,
                  )
                }
                disabled={isLoading}
                className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="categoryId"
              className="text-sm font-medium"
            >
              Category
            </label>

            <select
              id="categoryId"
              value={categoryId}
              onChange={(event) =>
                setCategoryId(
                  event.target.value,
                )
              }
              required
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
      </section>

      {/* Pricing & Inventory */}

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">
          Pricing & Inventory
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="regularPrice"
              className="text-sm font-medium"
            >
              Regular price
            </label>

            <input
              id="regularPrice"
              type="number"
              min="0"
              step="0.01"
              value={regularPrice}
              onChange={(event) =>
                setRegularPrice(
                  event.target.value,
                )
              }
              required
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="salePrice"
              className="text-sm font-medium"
            >
              Sale price
            </label>

            <input
              id="salePrice"
              type="number"
              min="0"
              step="0.01"
              value={salePrice}
              onChange={(event) =>
                setSalePrice(
                  event.target.value,
                )
              }
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="stockQuantity"
              className="text-sm font-medium"
            >
              Stock quantity
            </label>

            <input
              id="stockQuantity"
              type="number"
              min="0"
              step="1"
              value={stockQuantity}
              onChange={(event) =>
                setStockQuantity(
                  event.target.value,
                )
              }
              required
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="lowStockThreshold"
              className="text-sm font-medium"
            >
              Low stock threshold
            </label>

            <input
              id="lowStockThreshold"
              type="number"
              min="0"
              step="1"
              value={lowStockThreshold}
              onChange={(event) =>
                setLowStockThreshold(
                  event.target.value,
                )
              }
              required
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>
        </div>
      </section>

      {/* Specifications */}

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">
          Specifications
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="material"
              className="text-sm font-medium"
            >
              Material
            </label>

            <input
              id="material"
              value={material}
              onChange={(event) =>
                setMaterial(
                  event.target.value,
                )
              }
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="color"
              className="text-sm font-medium"
            >
              Color
            </label>

            <input
              id="color"
              value={color}
              onChange={(event) =>
                setColor(
                  event.target.value,
                )
              }
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="dimensions"
              className="text-sm font-medium"
            >
              Dimensions
            </label>

            <input
              id="dimensions"
              value={dimensions}
              onChange={(event) =>
                setDimensions(
                  event.target.value,
                )
              }
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="weight"
              className="text-sm font-medium"
            >
              Weight
            </label>

            <input
              id="weight"
              type="number"
              min="0"
              step="0.01"
              value={weight}
              onChange={(event) =>
                setWeight(
                  event.target.value,
                )
              }
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>
        </div>
      </section>

      {/* Additional Information */}

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">
          Additional Information
        </h2>

        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="assemblyInformation"
              className="text-sm font-medium"
            >
              Assembly information
            </label>

            <textarea
              id="assemblyInformation"
              value={assemblyInformation}
              onChange={(event) =>
                setAssemblyInformation(
                  event.target.value,
                )
              }
              rows={4}
              disabled={isLoading}
              className="w-full resize-none rounded-md border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="shippingInformation"
              className="text-sm font-medium"
            >
              Shipping information
            </label>

            <textarea
              id="shippingInformation"
              value={shippingInformation}
              onChange={(event) =>
                setShippingInformation(
                  event.target.value,
                )
              }
              rows={4}
              disabled={isLoading}
              className="w-full resize-none rounded-md border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="returnInformation"
              className="text-sm font-medium"
            >
              Return information
            </label>

            <textarea
              id="returnInformation"
              value={returnInformation}
              onChange={(event) =>
                setReturnInformation(
                  event.target.value,
                )
              }
              rows={4}
              disabled={isLoading}
              className="w-full resize-none rounded-md border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>
        </div>
      </section>

      {/* Product Images */}

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">
          Product Images
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Upload and manage product images.
          The first uploaded image becomes the
          primary image automatically.
        </p>

        <div className="mt-6">
          <ProductImageManager
            productId={initialData.id}
            productName={initialData.name}
            initialImages={images}
          />
        </div>
      </section>

      {/* Visibility */}

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">
          Visibility
        </h2>

        <div className="mt-6 space-y-5">
          <label className="flex cursor-pointer items-center gap-3">
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

            <div>
              <p className="text-sm font-medium">
                Active product
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Active products can be displayed in the
                storefront.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(event) =>
                setIsFeatured(
                  event.target.checked,
                )
              }
              disabled={isLoading}
              className="h-4 w-4"
            />

            <div>
              <p className="text-sm font-medium">
                Featured product
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Show this product in featured product
                sections.
              </p>
            </div>
          </label>
        </div>
      </section>

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
            router.push("/admin/products")
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
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
    </form>
  );
}