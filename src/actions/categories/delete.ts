"use server";

import { requireAdmin } from "@/lib/auth/permissions";

import {
  deleteCategoryService,
} from "@/services/category.service";

export type DeleteCategoryActionState = {
  success: boolean;
  message: string;
};

export async function deleteCategoryAction(
  id: string,
): Promise<DeleteCategoryActionState> {
  try {
    await requireAdmin();

    if (!id) {
      return {
        success: false,
        message: "Category ID is required.",
      };
    }

    await deleteCategoryService(id);

    return {
      success: true,
      message: "Category deleted successfully.",
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
      message: "Unable to delete category.",
    };
  }
}