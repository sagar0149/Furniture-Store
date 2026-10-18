import { z } from "zod";

const optionalString = (
  max: number,
) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""));

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      2,
      "Product name must be at least 2 characters.",
    )
    .max(
      200,
      "Product name cannot exceed 200 characters.",
    ),

  slug: z
    .string()
    .trim()
    .min(
      2,
      "Slug must be at least 2 characters.",
    )
    .max(
      220,
      "Slug cannot exceed 220 characters.",
    )
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens.",
    ),

  description: z
    .string()
    .trim()
    .min(
      1,
      "Product description is required.",
    ),

  sku: z
    .string()
    .trim()
    .min(
      1,
      "SKU is required.",
    )
    .max(
      100,
      "SKU cannot exceed 100 characters.",
    ),

  brand: optionalString(120),

  categoryId: z
    .string()
    .uuid("Please select a valid category."),

  regularPrice: z
    .string()
    .trim()
    .regex(
      /^\d+(?:\.\d{1,2})?$/,
      "Regular price must be a valid amount.",
    )
    .refine(
      (value) => Number(value) >= 0,
      "Regular price cannot be negative.",
    ),

  salePrice: z
    .string()
    .trim()
    .regex(
      /^\d+(?:\.\d{1,2})?$/,
      "Sale price must be a valid amount.",
    )
    .optional()
    .or(z.literal("")),

  stockQuantity: z
    .number()
    .int(
      "Stock quantity must be a whole number.",
    )
    .min(
      0,
      "Stock quantity cannot be negative.",
    )
    .default(0),

  lowStockThreshold: z
    .number()
    .int(
      "Low stock threshold must be a whole number.",
    )
    .min(
      0,
      "Low stock threshold cannot be negative.",
    )
    .default(5),

  material: optionalString(150),

  color: optionalString(100),

  dimensions: optionalString(200),

  weight: z
    .string()
    .trim()
    .regex(
      /^\d+(?:\.\d{1,2})?$/,
      "Weight must be a valid amount.",
    )
    .optional()
    .or(z.literal("")),

  assemblyInformation:
    optionalString(5000),

  shippingInformation:
    optionalString(5000),

  returnInformation:
    optionalString(5000),

  isFeatured: z
    .boolean()
    .default(false),

  isActive: z
    .boolean()
    .default(true),
}).superRefine((data, ctx) => {
  if (
    data.salePrice &&
    Number(data.salePrice) >
      Number(data.regularPrice)
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["salePrice"],
      message:
        "Sale price cannot be greater than regular price.",
    });
  }
});

export const updateProductSchema =
  productSchema.extend({
    id: z.string().uuid("Invalid product ID."),
  });

export type ProductInput =
  z.infer<typeof productSchema>;

export type UpdateProductInput =
  z.infer<typeof updateProductSchema>;