"use server";

import { requireUser } from "@/lib/auth/permissions";

import {
  getCartByUserId,
  getCartItem,
  updateCartItemQuantity,
  touchCart,
} from "@/repositories/cart.repository";

import {
  getProductById,
} from "@/repositories/product.repository";

type UpdateCartResult = {
  success: boolean;
  message: string;
  quantity?: number;
};

export async function updateCartItemAction(
  cartItemId: string,
  quantity: number,
): Promise<UpdateCartResult> {
  try {
    const user = await requireUser();

    if (!cartItemId) {
      return {
        success: false,
        message: "Cart item ID is required.",
      };
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return {
        success: false,
        message:
          "Quantity must be at least 1.",
      };
    }

    const cart =
      await getCartByUserId(user.id);

    if (!cart) {
      return {
        success: false,
        message: "Your cart was not found.",
      };
    }

    /*
     * We need to find the cart item.
     *
     * The repository currently provides
     * getCartItem(cartId, productId), but
     * update requires the cart item ID.
     *
     * The cart page will only send IDs that
     * belong to this user's cart.
     *
     * Ownership is additionally verified
     * through the cart itself below.
     */

    const cartItems =
      await import("@/db").then(
        async ({ db }) => {
          const { cartItems } =
            await import("@/db/schema");

          const { eq, and } =
            await import("drizzle-orm");

          return db
            .select()
            .from(cartItems)
            .where(
              and(
                eq(
                  cartItems.id,
                  cartItemId,
                ),
                eq(
                  cartItems.cartId,
                  cart.id,
                ),
              ),
            )
            .limit(1);
        },
      );

    const cartItem = cartItems[0];

    if (!cartItem) {
      return {
        success: false,
        message:
          "Cart item was not found.",
      };
    }

    const product =
      await getProductById(
        cartItem.productId,
      );

    if (!product || !product.isActive) {
      return {
        success: false,
        message:
          "This product is no longer available.",
      };
    }

    if (product.stockQuantity <= 0) {
      return {
        success: false,
        message:
          "This product is currently out of stock.",
      };
    }

    if (
      quantity >
      product.stockQuantity
    ) {
      return {
        success: false,
        message: `Only ${product.stockQuantity} item${
          product.stockQuantity === 1
            ? ""
            : "s"
        } available in stock.`,
      };
    }

    const updated =
      await updateCartItemQuantity(
        cartItemId,
        quantity,
      );

    if (!updated) {
      return {
        success: false,
        message:
          "Unable to update cart quantity.",
      };
    }

    await touchCart(cart.id);

    return {
      success: true,
      message: "Cart updated.",
      quantity: updated.quantity,
    };
  } catch (error) {
    console.error(
      "Update cart item error:",
      error,
    );

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message:
        "Unable to update cart.",
    };
  }
}