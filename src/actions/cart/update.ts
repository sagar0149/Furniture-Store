
"use server";

import { requireUser } from "@/lib/auth/permissions";
import { getProductById } from "@/repositories/product.repository";
import {
  getCartByUserId,
  getOrCreateCart,
  getCartItem,
  getCartItems,
  updateCartItemQuantity,
  touchCart,
} from "@/repositories/cart.repository";

type UpdateCartResult = {
  success: boolean;
  message: string;
  quantity?: number;
};

async function validateAndSaveQuantity(
  cartId: string,
  productId: string,
  quantity: number,
): Promise<UpdateCartResult> {
  if (!Number.isInteger(quantity) || quantity < 1) {
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

  const existingItem = await getCartItem(cartId, productId);

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

  await touchCart(cartId);

  return {
    success: true,
    message: "Cart quantity updated.",
    quantity: savedItem.quantity,
  };
}

/** Product page: identify the cart item by product ID. */
export async function updateCartQuantityAction(
  productId: string,
  quantity: number,
): Promise<UpdateCartResult> {
  try {
    const user = await requireUser();

    if (!productId) {
      return {
        success: false,
        message: "Product ID is required.",
      };
    }

    const cart = await getOrCreateCart(user.id);

    if (!cart) {
      return {
        success: false,
        message: "Unable to access your shopping cart.",
      };
    }

    return await validateAndSaveQuantity(
      cart.id,
      productId,
      quantity,
    );
  } catch (error) {
    console.error("Update product cart quantity error:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update cart quantity.",
    };
  }
}

/** Cart page: identify the item by cart item ID and verify ownership. */
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

    if (!Number.isInteger(quantity) || quantity < 1) {
      return {
        success: false,
        message: "Quantity must be at least 1.",
      };
    }

    const cart = await getCartByUserId(user.id);

    if (!cart) {
      return {
        success: false,
        message: "Cart not found.",
      };
    }

    const items = await getCartItems(cart.id);

    const item = items.find(
      (entry) => entry.cartItem.id === cartItemId,
    );

    if (!item) {
      return {
        success: false,
        message: "Cart item not found.",
      };
    }

    return await validateAndSaveQuantity(
      cart.id,
      item.cartItem.productId,
      quantity,
    );
  } catch (error) {
    console.error("Update cart item error:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update cart quantity.",
    };
  }
}
