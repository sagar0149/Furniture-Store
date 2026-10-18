"use server";

import { requireUser } from "@/lib/auth/permissions";

import {
  getCartByUserId,
  getCartItems,
  deleteCartItem,
  touchCart,
} from "@/repositories/cart.repository";

export type RemoveCartItemState = {
  success: boolean;
  message: string;
};

export async function removeCartItemAction(
  cartItemId: string,
): Promise<RemoveCartItemState> {
  try {
    const user = await requireUser();

    if (!cartItemId) {
      return {
        success: false,
        message: "Cart item ID is required.",
      };
    }

    const cart =
      await getCartByUserId(user.id);

    if (!cart) {
      return {
        success: false,
        message: "Cart not found.",
      };
    }

    const cartItems =
      await getCartItems(cart.id);

    const item = cartItems.find(
      (item) =>
        item.cartItem.id === cartItemId,
    );

    if (!item) {
      return {
        success: false,
        message: "Cart item not found.",
      };
    }

    const deleted =
      await deleteCartItem(cartItemId);

    if (!deleted) {
      return {
        success: false,
        message:
          "Unable to remove cart item.",
      };
    }

    await touchCart(cart.id);

    return {
      success: true,
      message:
        "Product removed from cart.",
    };
  } catch (error) {
    console.error(
      "Remove cart item error:",
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
        "Unable to remove product.",
    };
  }
}