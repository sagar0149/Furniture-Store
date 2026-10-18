"use server";

import { requireAdmin } from "@/lib/auth/permissions";

import {
  updateCategoryService,
} from "@/services/category.service";

export type UpdateCategoryActionState = {
  success: boolean;
  message: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
};

export async function updateCategoryAction(
  input: unknown,
): Promise<UpdateCategoryActionState> {
  try {
    await requireAdmin();

    const category =
      await updateCategoryService(input);

    return {
      success: true,
      message: "Category updated successfully.",
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        isActive: category.isActive,
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
      message: "Unable to update category.",
    };
  }
}