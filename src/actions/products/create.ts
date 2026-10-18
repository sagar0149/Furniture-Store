"use server";

import { requireAdmin } from "@/lib/auth/permissions";

import {
  createProductService,
} from "@/services/product.service";

export type CreateProductActionState = {
  success: boolean;
  message: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    sku: string;
  };
};

export async function createProductAction(
  input: unknown,
): Promise<CreateProductActionState> {
  try {
    await requireAdmin();

    const product =
      await createProductService(input);

    return {
      success: true,
      message: "Product created successfully.",
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
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
      message: "Unable to create product.",
    };
  }
}