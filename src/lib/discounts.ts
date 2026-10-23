
import type { DiscountType } from "@/repositories/discount.repository";

export type DiscountRule = {
  id: string;
  name: string;
  type: DiscountType;
  value: string | number;
};

export type DiscountProduct = {
  id: string;
  categoryId: string;
  salePrice: string | number | null;
  regularPrice: string | number;
};

export type ProductDiscountResult = {
  originalPrice: number;
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
  discountName: string | null;
  discountId: string | null;
};

export function calculateProductDiscount(
  product: DiscountProduct,
  discounts: DiscountRule[],
): ProductDiscountResult {
  const originalPrice = Number(product.regularPrice);

  const basePrice = Number(
    product.salePrice ?? product.regularPrice,
  );

  if (
    !Number.isFinite(originalPrice) ||
    !Number.isFinite(basePrice) ||
    originalPrice < 0 ||
    basePrice < 0
  ) {
    throw new Error("Invalid product price.");
  }

  let bestDiscount = 0;
  let bestDiscountName: string | null = null;
  let bestDiscountId: string | null = null;

  for (const discount of discounts) {
    const value = Number(discount.value);

    if (!Number.isFinite(value) || value <= 0) {
      continue;
    }

    const rawAmount =
      discount.type === "PERCENTAGE"
        ? (basePrice * Math.min(value, 100)) / 100
        : value;

    // Never discount below zero or stack discounts.
    const amount = Math.min(
      basePrice,
      Math.round(rawAmount * 100) / 100,
    );

    if (amount > bestDiscount) {
      bestDiscount = amount;
      bestDiscountName = discount.name;
      bestDiscountId = discount.id;
    }
  }

  const discountAmount =
    Math.round(bestDiscount * 100) / 100;

  return {
    originalPrice,
    basePrice,
    discountAmount,
    finalPrice: Math.round(
      (basePrice - discountAmount) * 100,
    ) / 100,
    discountName: bestDiscountName,
    discountId: bestDiscountId,
  };
}
