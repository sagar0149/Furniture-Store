"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createProductAction } from "@/actions/products/create";

type CategoryOption = {
  id: string;
  name: string;
};

type ProductFormProps = {
  categories: CategoryOption[];
};

export function ProductForm({
  categories,
}: ProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] =
    useState("");

  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [regularPrice, setRegularPrice] =
    useState("");

  const [salePrice, setSalePrice] =
    useState("");

  const [stockQuantity, setStockQuantity] =
    useState("0");

  const [lowStockThreshold, setLowStockThreshold] =
    useState("5");

  const [material, setMaterial] =
    useState("");

  const [color, setColor] =
    useState("");

  const [dimensions, setDimensions] =
    useState("");

  const [weight, setWeight] =
    useState("");

  const [
    assemblyInformation,
    setAssemblyInformation,
  ] = useState("");

  const [
    shippingInformation,
    setShippingInformation,
  ] = useState("");

  const [
    returnInformation,
    setReturnInformation,
  ] = useState("");

  const [isFeatured, setIsFeatured] =
    useState(false);

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

  function handleNameChange(value: string) {
    setName(value);

    if (!slug) {
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
      const result =
        await createProductAction({
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
          isActive: true,
        });

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(
        "Create product error:",
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
                handleNameChange(
                  event.target.value,
                )
              }
              placeholder="Modern 3-Seater Sofa"
              required
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
              placeholder="modern-3-seater-sofa"
              required
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
              placeholder="Describe the product..."
              rows={6}
              required
              disabled={isLoading}
              className="w-full resize-none rounded-md border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
                placeholder="SOFA-001"
                required
                disabled={isLoading}
                className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
                placeholder="Your Brand"
                disabled={isLoading}
                className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">
                Select category
              </option>

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
              placeholder="49999.00"
              required
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
              placeholder="44999.00"
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
              placeholder="Solid Wood"
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
              placeholder="Walnut"
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
              placeholder="200 × 90 × 85 cm"
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
              placeholder="45.50"
              disabled={isLoading}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
              placeholder="Assembly instructions..."
              disabled={isLoading}
              className="w-full resize-none rounded-md border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
              placeholder="Shipping details..."
              disabled={isLoading}
              className="w-full resize-none rounded-md border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
              placeholder="Return policy information..."
              disabled={isLoading}
              className="w-full resize-none rounded-md border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </section>

      {/* Featured */}

      <section className="rounded-xl border p-6">
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
              Show this product in featured
              product sections.
            </p>
          </div>
        </label>
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
            ? "Creating..."
            : "Create Product"}
        </button>
      </div>
    </form>
  );
}