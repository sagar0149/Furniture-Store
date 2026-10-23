
"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/permissions";

import {
  createAdminDiscount,
  deleteAdminDiscount,
  setAdminDiscountEnabled,
  updateAdminDiscount,
  type DiscountInput,
} from "@/repositories/discount.repository";

export type DiscountActionResult = {
  success: boolean;
  message: string;
};

function parseDiscountFormData(
  formData: FormData,
): DiscountInput {
  const name = String(
    formData.get("name") ?? "",
  ).trim();

  const description = String(
    formData.get("description") ?? "",
  ).trim();

  const typeValue = String(
    formData.get("type") ?? "",
  );

  if (
    typeValue !== "PERCENTAGE" &&
    typeValue !== "FIXED_AMOUNT"
  ) {
    throw new Error(
      "Select a valid discount type.",
    );
  }

  const rawValue = formData.get("value");

  if (
    rawValue === null ||
    String(rawValue).trim() === ""
  ) {
    throw new Error(
      "Discount value is required.",
    );
  }

  const value = Number(rawValue);

  const startAt = new Date(
    String(formData.get("startAt") ?? ""),
  );

  const endAt = new Date(
    String(formData.get("endAt") ?? ""),
  );

  const enabled =
    formData.get("enabled") === "on";

  const productIds = [
    ...new Set(
      formData
        .getAll("productIds")
        .map(String)
        .filter(Boolean),
    ),
  ];

  const categoryIds = [
    ...new Set(
      formData
        .getAll("categoryIds")
        .map(String)
        .filter(Boolean),
    ),
  ];

  return {
    name,
    description,
    type: typeValue,
    value,
    startAt,
    endAt,
    enabled,
    productIds,
    categoryIds,
  };
}

function resultFromError(
  error: unknown,
): DiscountActionResult {
  return {
    success: false,
    message:
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.",
  };
}

export async function createDiscountAction(
  _previousState: DiscountActionResult | null,
  formData: FormData,
): Promise<DiscountActionResult> {
  await requireAdmin();

  try {
    const input =
      parseDiscountFormData(formData);

    await createAdminDiscount(input);

    revalidatePath("/admin/discounts");

    return {
      success: true,
      message: "Discount created successfully.",
    };
  } catch (error) {
    return resultFromError(error);
  }
}

export async function updateDiscountAction(
  id: string,
  _previousState: DiscountActionResult | null,
  formData: FormData,
): Promise<DiscountActionResult> {
  await requireAdmin();

  try {
    if (!id) {
      throw new Error(
        "Discount ID is required.",
      );
    }

    const input =
      parseDiscountFormData(formData);

    await updateAdminDiscount(id, input);

    revalidatePath("/admin/discounts");
    revalidatePath(
      `/admin/discounts/${id}/edit`,
    );

    return {
      success: true,
      message: "Discount updated successfully.",
    };
  } catch (error) {
    return resultFromError(error);
  }
}

export async function toggleDiscountAction(
  id: string,
  enabled: boolean,
): Promise<DiscountActionResult> {
  await requireAdmin();

  try {
    if (!id) {
      throw new Error(
        "Discount ID is required.",
      );
    }

    if (typeof enabled !== "boolean") {
      throw new Error(
        "Invalid discount status.",
      );
    }

    await setAdminDiscountEnabled(
      id,
      enabled,
    );

    revalidatePath("/admin/discounts");

    return {
      success: true,
      message: enabled
        ? "Discount enabled successfully."
        : "Discount disabled successfully.",
    };
  } catch (error) {
    return resultFromError(error);
  }
}

export async function deleteDiscountAction(
  id: string,
): Promise<DiscountActionResult> {
  await requireAdmin();

  try {
    if (!id) {
      throw new Error(
        "Discount ID is required.",
      );
    }

    await deleteAdminDiscount(id);

    revalidatePath("/admin/discounts");

    return {
      success: true,
      message: "Discount deleted successfully.",
    };
  } catch (error) {
    return resultFromError(error);
  }
}
