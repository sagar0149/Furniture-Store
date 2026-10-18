import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/permissions";

import {
  getAllCategories,
} from "@/repositories/category.repository";

import {
  getProductById,
  getProductImages,
} from "@/repositories/product.repository";

import { ProductEditForm } from "@/components/admin/product-edit-form";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  await requireAdmin();

  const { id } = await params;

  const [product, categories, images] =
    await Promise.all([
      getProductById(id),
      getAllCategories(),
      getProductImages(id),
    ]);

  if (!product) {
    notFound();
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/admin/products"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Products
          </Link>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Edit Product
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Update the details of{" "}
            <strong>{product.name}</strong>.
          </p>
        </div>

        <ProductEditForm
          categories={categories.map(
            (category) => ({
              id: category.id,
              name: category.name,
            }),
          )}
          initialData={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description:
              product.description,
            sku: product.sku,
            brand:
              product.brand ?? "",
            categoryId:
              product.categoryId,
            regularPrice:
              product.regularPrice,
            salePrice:
              product.salePrice ?? "",
            stockQuantity:
              product.stockQuantity,
            lowStockThreshold:
              product.lowStockThreshold,
            material:
              product.material ?? "",
            color:
              product.color ?? "",
            dimensions:
              product.dimensions ?? "",
            weight:
              product.weight ?? "",
            assemblyInformation:
              product.assemblyInformation ??
              "",
            shippingInformation:
              product.shippingInformation ??
              "",
            returnInformation:
              product.returnInformation ??
              "",
            isFeatured:
              product.isFeatured,
            isActive:
              product.isActive,
          }}
          images={images.map(
            (image) => ({
              id: image.id,
              url: image.url,
              publicId:
                image.publicId,
              altText:
                image.altText ?? "",
              isPrimary:
                image.isPrimary,
              displayOrder:
                image.displayOrder,
            }),
          )}
        />
      </div>
    </main>
  );
}