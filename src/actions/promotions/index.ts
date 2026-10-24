
"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/permissions";
import {
  deletePromotion,
  setPromotionEnabled,
} from "@/repositories/promotion.repository";

export type PromotionActionResult = {
  success: boolean;
  message: string;
};

export async function togglePromotionAction(
  id: string,
  enabled: boolean,
): Promise<PromotionActionResult> {
  await requireAdmin();

  try {
    if (!id || typeof enabled !== "boolean") {
      throw new Error("Invalid promotion details.");
    }

    const result = await setPromotionEnabled(id, enabled);

    if (!result) {
      throw new Error("Promotion not found.");
    }

    revalidatePath("/admin/promotions");
    revalidatePath("/");

    return {
      success: true,
      message: enabled
        ? "Promotion enabled successfully."
        : "Promotion disabled successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update promotion.",
    };
  }
}

export async function deletePromotionAction(
  id: string,
): Promise<PromotionActionResult> {
  await requireAdmin();

  try {
    if (!id) {
      throw new Error("Promotion ID is required.");
    }

    const result = await deletePromotion(id);

    if (!result) {
      throw new Error("Promotion not found.");
    }

    revalidatePath("/admin/promotions");
    revalidatePath("/");

    return {
      success: true,
      message: "Promotion deleted successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to delete promotion.",
    };
  }
}
