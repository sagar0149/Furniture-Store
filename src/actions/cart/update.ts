
"use server";

import { requireUser } from "@/lib/auth/permissions";

import {
  getProductById,
} from "@/repositories/product.repository";

import {
  getOrCreateCart,
  getCartItem,
  updateCartItemQuantity,
  touchCart,
} from "@/repositories/cart.repository";

type UpdateCartQuantityResult = {
  success: boolean;
  message: string;
  quantity?: number;
};

export async function updateCartQuantityAction(
  productId: string,
  quantity: number,
): Promise<UpdateCartQuantityResult> {
  try {
    const user = await requireUser();

    if (!productId) {
      return {
        success: false,
        message: "Product ID is required.",
      };
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return {
        success: false,
        message: "Quantity must be at least 1.",
      };
    }

    const product = await getProductById(productId);

    if (!product || !product.isActive) {
      return {
        success: false,
        message: "Product is not available.",
      };
    }

    if (quantity > product.stockQuantity) {
      return {
        success: false,
        message: `Only ${product.stockQuantity} item${
          product.stockQuantity === 1 ? "" : "s"
        } available in stock.`,
      };
    }

    const cart = await getOrCreateCart(user.id);

    if (!cart) {
      return {
        success: false,
        message: "Unable to access your shopping cart.",
      };
    }

    const existingItem = await getCartItem(
      cart.id,
      product.id,
    );

    if (!existingItem) {
      return {
        success: false,
        message: "This product is not in your cart.",
      };
    }

    const savedItem = await updateCartItemQuantity(
      existingItem.id,
      quantity,
    );

    if (!savedItem) {
      return {
        success: false,
        message: "Unable to update cart quantity.",
      };
    }

    await touchCart(cart.id);

    return {
      success: true,
      message: "Cart quantity updated.",
      quantity: savedItem.quantity,
    };
  } catch (error) {
    console.error("Update cart quantity error:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update cart quantity.",
    };
  }
}
