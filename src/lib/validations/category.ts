import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      2,
      "Category name must be at least 2 characters.",
    )
    .max(
      120,
      "Category name cannot exceed 120 characters.",
    ),

  slug: z
    .string()
    .trim()
    .min(
      2,
      "Slug must be at least 2 characters.",
    )
    .max(
      160,
      "Slug cannot exceed 160 characters.",
    )
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens.",
    ),

  description: z
    .string()
    .trim()
    .max(
      500,
      "Description cannot exceed 500 characters.",
    )
    .optional()
    .or(z.literal("")),

  imageUrl: z
    .string()
    .trim()
    .url("Please provide a valid image URL.")
    .max(2048)
    .optional()
    .or(z.literal("")),

  imagePublicId: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),

  parentId: z
    .string()
    .uuid("Invalid parent category.")
    .optional()
    .or(z.literal("")),

  displayOrder: z
    .number()
    .int(
      "Display order must be a whole number.",
    )
    .min(
      0,
      "Display order cannot be negative.",
    )
    .default(0),
});

export const updateCategorySchema =
  categorySchema.extend({
    id: z.string().uuid("Invalid category ID."),

    isActive: z.boolean().optional(),
  });

export type CategoryInput =
  z.infer<typeof categorySchema>;

export type UpdateCategoryInput =
  z.infer<typeof updateCategorySchema>;