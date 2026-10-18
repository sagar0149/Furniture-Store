import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(120, "Name is too long."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address.")
    .max(255, "Email is too long."),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password is too long."),

  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long.")
    .optional()
    .or(z.literal("")),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address.")
    .max(255, "Email is too long."),

  password: z
    .string()
    .min(1, "Password is required.")
    .max(72, "Password is too long."),
});

export type RegisterSchemaInput = z.infer<
  typeof registerSchema
>;

export type LoginSchemaInput = z.infer<
  typeof loginSchema
>;
export const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .min(1, "Reset token is required."),

    password: z
      .string()
      .min(
        8,
        "Password must be at least 8 characters.",
      )
      .max(
        72,
        "Password is too long.",
      ),

    confirmPassword: z
      .string()
      .min(
        1,
        "Please confirm your password.",
      ),
  })
  .refine(
    (data) =>
      data.password === data.confirmPassword,
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    },
  );

export type ResetPasswordSchemaInput =
  z.infer<typeof resetPasswordSchema>;