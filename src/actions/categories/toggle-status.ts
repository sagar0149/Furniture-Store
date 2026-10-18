"use server";

import { requireAdmin } from "@/lib/auth/permissions";

import {
  getCategoryById,
  updateCategory,
} from "@/repositories/category.repository";

export type ToggleCategoryStatusActionState = {
  success: boolean;
  message: string;
  isActive?: boolean;
};

export async function toggleCategoryStatusAction(
  id: string,
): Promise<ToggleCategoryStatusActionState> {
  try {
    await requireAdmin();

    if (!id) {
      return {
        success: false,
        message: "Category ID is required.",
      };
    }

    const category = await getCategoryById(id);

    if (!category) {
      return {
        success: false,
        message: "Category not found.",
      };
    }

    const updatedCategory =
      await updateCategory(id, {
        isActive: !category.isActive,
      });

    if (!updatedCategory) {
      return {
        success: false,
        message: "Unable to update category status.",
      };
    }

    return {
      success: true,
      message: updatedCategory.isActive
        ? "Category activated successfully."
        : "Category deactivated successfully.",
      isActive: updatedCategory.isActive,
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
      message: "Unable to update category status.",
    };
  }
}