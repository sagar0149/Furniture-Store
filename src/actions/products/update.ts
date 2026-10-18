"use server";

import { requireAdmin } from "@/lib/auth/permissions";

import {
  updateProductService,
} from "@/services/product.service";

export type UpdateProductActionState = {
  success: boolean;
  message: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    isActive: boolean;
    isFeatured: boolean;
  };
};

export async function updateProductAction(
  input: unknown,
): Promise<UpdateProductActionState> {
  try {
    await requireAdmin();

    const product =
      await updateProductService(input);

    return {
      success: true,
      message: "Product updated successfully.",
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "Unable to update product.",
    };
  }
}