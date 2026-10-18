"use server";

import { requireAdmin } from "@/lib/auth/permissions";

import {
  createCategoryService,
} from "@/services/category.service";

export type CreateCategoryActionState = {
  success: boolean;
  message: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
};

export async function createCategoryAction(
  input: unknown,
): Promise<CreateCategoryActionState> {
  try {
    await requireAdmin();

    const category =
      await createCategoryService(input);

    return {
      success: true,
      message: "Category created successfully.",
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
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
      message: "Unable to create category.",
    };
  }
}