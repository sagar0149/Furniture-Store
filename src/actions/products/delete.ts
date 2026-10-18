"use server";

import { requireAdmin } from "@/lib/auth/permissions";

import {
  deleteProductService,
} from "@/services/product.service";

export type DeleteProductActionState = {
  success: boolean;
  message: string;
};

export async function deleteProductAction(
  id: string,
): Promise<DeleteProductActionState> {
  try {
    await requireAdmin();

    if (!id) {
      return {
        success: false,
        message: "Product ID is required.",
      };
    }

    await deleteProductService(id);

    return {
      success: true,
      message: "Product deleted successfully.",
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
      message: "Unable to delete product.",
    };
  }
}