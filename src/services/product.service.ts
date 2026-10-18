import {
  createProduct,
  deleteProduct,
  getProductById,
  getProductBySku,
  getProductBySlug,
  updateProduct,
} from "@/repositories/product.repository";

import {
  getCategoryById,
} from "@/repositories/category.repository";

import {
  productSchema,
  updateProductSchema,
} from "@/lib/validations/product";

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

function normalizeSku(sku: string) {
  return sku.trim().toUpperCase();
}

export async function createProductService(
  input: unknown,
) {
  const validated =
    productSchema.parse(input);

  const slug =
    normalizeSlug(validated.slug);

  const sku =
    normalizeSku(validated.sku);

  // Check for duplicate slug.
  const existingSlug =
    await getProductBySlug(slug);

  if (existingSlug) {
    throw new Error(
      "A product with this slug already exists.",
    );
  }

  // Check for duplicate SKU.
  const existingSku =
    await getProductBySku(sku);

  if (existingSku) {
    throw new Error(
      "A product with this SKU already exists.",
    );
  }

  // Make sure the selected category exists.
  const category =
    await getCategoryById(
      validated.categoryId,
    );

  if (!category) {
    throw new Error(
      "The selected category does not exist.",
    );
  }

  // Do not allow products in inactive categories.
  if (!category.isActive) {
    throw new Error(
      "The selected category is inactive.",
    );
  }

  const product =
    await createProduct({
      name: validated.name,
      slug,
      description:
        validated.description,
      sku,
      brand:
        validated.brand || undefined,
      categoryId:
        validated.categoryId,
      regularPrice:
        validated.regularPrice,
      salePrice:
        validated.salePrice || undefined,
      stockQuantity:
        validated.stockQuantity,
      lowStockThreshold:
        validated.lowStockThreshold,
      material:
        validated.material || undefined,
      color:
        validated.color || undefined,
      dimensions:
        validated.dimensions || undefined,
      weight:
        validated.weight || undefined,
      assemblyInformation:
        validated.assemblyInformation ||
        undefined,
      shippingInformation:
        validated.shippingInformation ||
        undefined,
      returnInformation:
        validated.returnInformation ||
        undefined,
      isFeatured:
        validated.isFeatured,
      isActive:
        validated.isActive,
    });

  if (!product) {
    throw new Error(
      "Unable to create product.",
    );
  }

  return product;
}

export async function updateProductService(
  input: unknown,
) {
  const validated =
    updateProductSchema.parse(input);

  const existingProduct =
    await getProductById(
      validated.id,
    );

  if (!existingProduct) {
    throw new Error(
      "Product not found.",
    );
  }

  const slug =
    normalizeSlug(validated.slug);

  const sku =
    normalizeSku(validated.sku);

  // Check slug ownership.
  const productWithSlug =
    await getProductBySlug(slug);

  if (
    productWithSlug &&
    productWithSlug.id !==
      validated.id
  ) {
    throw new Error(
      "A product with this slug already exists.",
    );
  }

  // Check SKU ownership.
  const productWithSku =
    await getProductBySku(sku);

  if (
    productWithSku &&
    productWithSku.id !==
      validated.id
  ) {
    throw new Error(
      "A product with this SKU already exists.",
    );
  }

  // Validate category.
  const category =
    await getCategoryById(
      validated.categoryId,
    );

  if (!category) {
    throw new Error(
      "The selected category does not exist.",
    );
  }

  if (!category.isActive) {
    throw new Error(
      "The selected category is inactive.",
    );
  }

  const updatedProduct =
    await updateProduct(
      validated.id,
      {
        name: validated.name,
        slug,
        description:
          validated.description,
        sku,
        brand:
          validated.brand || undefined,
        categoryId:
          validated.categoryId,
        regularPrice:
          validated.regularPrice,
        salePrice:
          validated.salePrice || null,
        stockQuantity:
          validated.stockQuantity,
        lowStockThreshold:
          validated.lowStockThreshold,
        material:
          validated.material || undefined,
        color:
          validated.color || undefined,
        dimensions:
          validated.dimensions || undefined,
        weight:
          validated.weight || null,
        assemblyInformation:
          validated.assemblyInformation ||
          undefined,
        shippingInformation:
          validated.shippingInformation ||
          undefined,
        returnInformation:
          validated.returnInformation ||
          undefined,
        isFeatured:
          validated.isFeatured,
        isActive:
          validated.isActive,
      },
    );

  if (!updatedProduct) {
    throw new Error(
      "Unable to update product.",
    );
  }

  return updatedProduct;
}

export async function deleteProductService(
  id: string,
) {
  const product =
    await getProductById(id);

  if (!product) {
    throw new Error(
      "Product not found.",
    );
  }

  const deletedProduct =
    await deleteProduct(id);

  if (!deletedProduct) {
    throw new Error(
      "Unable to delete product.",
    );
  }

  return deletedProduct;
}