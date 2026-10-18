import {
  createCategory,
  deleteCategory,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
} from "@/repositories/category.repository";

import {
  categorySchema,
  updateCategorySchema,
} from "@/lib/validations/category";

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

export async function createCategoryService(
  input: unknown,
) {
  const validated = categorySchema.parse(input);

  const slug = normalizeSlug(validated.slug);

  const existingCategory =
    await getCategoryBySlug(slug);

  if (existingCategory) {
    throw new Error(
      "A category with this slug already exists.",
    );
  }

  const category =
    await createCategory({
      name: validated.name,
      slug,
      description:
        validated.description || undefined,
      imageUrl:
        validated.imageUrl || undefined,
      imagePublicId:
        validated.imagePublicId || undefined,
      parentId:
        validated.parentId || undefined,
      displayOrder:
        validated.displayOrder,
    });

  if (!category) {
    throw new Error(
      "Unable to create category.",
    );
  }

  return category;
}

export async function updateCategoryService(
  input: unknown,
) {
  const validated =
    updateCategorySchema.parse(input);

  const existingCategory =
    await getCategoryById(validated.id);

  if (!existingCategory) {
    throw new Error(
      "Category not found.",
    );
  }

  const slug = normalizeSlug(validated.slug);

  const categoryWithSlug =
    await getCategoryBySlug(slug);

  if (
    categoryWithSlug &&
    categoryWithSlug.id !== validated.id
  ) {
    throw new Error(
      "A category with this slug already exists.",
    );
  }

  /*
   * Prevent a category from becoming
   * its own parent.
   */
  if (
    validated.parentId &&
    validated.parentId === validated.id
  ) {
    throw new Error(
      "A category cannot be its own parent.",
    );
  }

  const updatedCategory =
    await updateCategory(
      validated.id,
      {
        name: validated.name,
        slug,
        description:
          validated.description || undefined,
        imageUrl:
          validated.imageUrl || undefined,
        imagePublicId:
          validated.imagePublicId || undefined,
        parentId:
          validated.parentId || null,
        displayOrder:
          validated.displayOrder,
        isActive:
          validated.isActive,
      },
    );

  if (!updatedCategory) {
    throw new Error(
      "Unable to update category.",
    );
  }

  return updatedCategory;
}

export async function deleteCategoryService(
  id: string,
) {
  const category =
    await getCategoryById(id);

  if (!category) {
    throw new Error(
      "Category not found.",
    );
  }

  const deletedCategory =
    await deleteCategory(id);

  if (!deletedCategory) {
    throw new Error(
      "Unable to delete category.",
    );
  }

  return deletedCategory;
}