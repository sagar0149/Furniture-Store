"use server";

import { requireAdmin } from "@/lib/auth/permissions";

import {
  getProductById,
  updateProduct,
} from "@/repositories/product.repository";

export type ToggleProductStatusActionState = {
  success: boolean;
  message: string;
  isActive?: boolean;
  isFeatured?: boolean;
};

export async function toggleProductStatusAction(
  id: string,
  field: "isActive" | "isFeatured",
): Promise<ToggleProductStatusActionState> {
  try {
    await requireAdmin();

    if (!id) {
      return {
        success: false,
        message: "Product ID is required.",
      };
    }

    if (
      field !== "isActive" &&
      field !== "isFeatured"
    ) {
      return {
        success: false,
        message: "Invalid status field.",
      };
    }

    const product = await getProductById(id);

    if (!product) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    const newValue =
      field === "isActive"
        ? !product.isActive
        : !product.isFeatured;

    const updatedProduct =
      await updateProduct(id, {
        [field]: newValue,
      });

    if (!updatedProduct) {
      return {
        success: false,
        message: "Unable to update product.",
      };
    }

    return {
      success: true,
      message:
        field === "isActive"
          ? updatedProduct.isActive
            ? "Product activated successfully."
            : "Product deactivated successfully."
          : updatedProduct.isFeatured
            ? "Product marked as featured."
            : "Product removed from featured products.",
      isActive: updatedProduct.isActive,
      isFeatured: updatedProduct.isFeatured,
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