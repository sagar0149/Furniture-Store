import {
  and,
  asc,
  desc,
  eq,
} from "drizzle-orm";

import { db } from "@/db";

import {
  products,
  productImages,
} from "@/db/schema";

export async function getAllProducts() {
  return db
    .select()
    .from(products)
    .orderBy(
      desc(products.createdAt),
      asc(products.name),
    );
}

export async function getActiveProducts() {
  return db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(
      asc(products.name),
    );
}

export async function getFeaturedProducts() {
  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.isFeatured, true),
        eq(products.isActive, true),
      ),
    )
    .orderBy(
      asc(products.name),
    );
}

export async function getProductsByCategoryId(
  categoryId: string,
) {
  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.categoryId, categoryId),
        eq(products.isActive, true),
      ),
    )
    .orderBy(
      asc(products.name),
    );
}

export async function getProductById(
  id: string,
) {
  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function getProductBySlug(
  slug: string,
) {
  const result = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  return result[0] ?? null;
}

export async function getProductBySku(
  sku: string,
) {
  const result = await db
    .select()
    .from(products)
    .where(eq(products.sku, sku))
    .limit(1);

  return result[0] ?? null;
}

export async function createProduct(
  data: {
    name: string;
    slug: string;
    description: string;
    sku: string;
    brand?: string;
    categoryId: string;
    regularPrice: string;
    salePrice?: string;
    stockQuantity?: number;
    lowStockThreshold?: number;
    material?: string;
    color?: string;
    dimensions?: string;
    weight?: string;
    assemblyInformation?: string;
    shippingInformation?: string;
    returnInformation?: string;
    isFeatured?: boolean;
    isActive?: boolean;
  },
) {
  const result = await db
    .insert(products)
    .values({
      name: data.name,
      slug: data.slug,
      description: data.description,
      sku: data.sku,
      brand: data.brand,
      categoryId: data.categoryId,
      regularPrice: data.regularPrice,
      salePrice: data.salePrice,
      stockQuantity:
        data.stockQuantity ?? 0,
      lowStockThreshold:
        data.lowStockThreshold ?? 5,
      material: data.material,
      color: data.color,
      dimensions: data.dimensions,
      weight: data.weight,
      assemblyInformation:
        data.assemblyInformation,
      shippingInformation:
        data.shippingInformation,
      returnInformation:
        data.returnInformation,
      isFeatured:
        data.isFeatured ?? false,
      isActive:
        data.isActive ?? true,
    })
    .returning();

  return result[0] ?? null;
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    sku?: string;
    brand?: string;
    categoryId?: string;
    regularPrice?: string;
    salePrice?: string | null;
    stockQuantity?: number;
    lowStockThreshold?: number;
    material?: string;
    color?: string;
    dimensions?: string;
    weight?: string | null;
    assemblyInformation?: string;
    shippingInformation?: string;
    returnInformation?: string;
    isFeatured?: boolean;
    isActive?: boolean;
  },
) {
  const result = await db
    .update(products)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();

  return result[0] ?? null;
}

export async function deleteProduct(
  id: string,
) {
  const result = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning({
      id: products.id,
    });

  return result[0] ?? null;
}

/*
 * Product images
 */

export async function getProductImages(
  productId: string,
) {
  return db
    .select()
    .from(productImages)
    .where(
      eq(
        productImages.productId,
        productId,
      ),
    )
    .orderBy(
      asc(productImages.displayOrder),
      asc(productImages.createdAt),
    );
}

export async function getPrimaryProductImage(
  productId: string,
) {
  const result = await db
    .select()
    .from(productImages)
    .where(
      and(
        eq(
          productImages.productId,
          productId,
        ),
        eq(
          productImages.isPrimary,
          true,
        ),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

export async function createProductImage(
  data: {
    productId: string;
    url: string;
    publicId: string;
    altText?: string;
    isPrimary?: boolean;
    displayOrder?: number;
  },
) {
  const result = await db
    .insert(productImages)
    .values({
      productId: data.productId,
      url: data.url,
      publicId: data.publicId,
      altText: data.altText,
      isPrimary:
        data.isPrimary ?? false,
      displayOrder:
        data.displayOrder ?? 0,
    })
    .returning();

  return result[0] ?? null;
}

export async function deleteProductImage(
  id: string,
) {
  const result = await db
    .delete(productImages)
    .where(eq(productImages.id, id))
    .returning({
      id: productImages.id,
    });

  return result[0] ?? null;
}

export async function clearPrimaryProductImages(
  productId: string,
) {
  return db
    .update(productImages)
    .set({
      isPrimary: false,
    })
    .where(
      eq(
        productImages.productId,
        productId,
      ),
    );
}
export async function setPrimaryProductImage(
  productId: string,
  imageId: string,
) {
  const result = await db
    .update(productImages)
    .set({
      isPrimary: true,
    })
    .where(
      and(
        eq(
          productImages.id,
          imageId,
        ),
        eq(
          productImages.productId,
          productId,
        ),
      ),
    )
    .returning();

  return result[0] ?? null;
}