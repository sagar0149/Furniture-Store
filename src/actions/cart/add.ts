"use server";

import { requireUser } from "@/lib/auth/permissions";

import {
  getProductById,
} from "@/repositories/product.repository";

import {
  getOrCreateCart,
  getCartItem,
  createCartItem,
  updateCartItemQuantity,
  touchCart,
} from "@/repositories/cart.repository";

type AddToCartResult = {
  success: boolean;
  message: string;
  quantity?: number;
};

export async function addToCartAction(
  productId: string,
  quantity: number = 1,
): Promise<AddToCartResult> {
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
        message:
          "Quantity must be at least 1.",
      };
    }

    const product =
      await getProductById(productId);

    if (!product || !product.isActive) {
      return {
        success: false,
        message: "Product is not available.",
      };
    }

    if (product.stockQuantity <= 0) {
      return {
        success: false,
        message:
          "This product is currently out of stock.",
      };
    }

    const cart =
      await getOrCreateCart(user.id);

    if (!cart) {
      return {
        success: false,
        message:
          "Unable to create your shopping cart.",
      };
    }

    const existingItem =
      await getCartItem(
        cart.id,
        product.id,
      );

    const currentQuantity =
      existingItem?.quantity ?? 0;

    const newQuantity =
      currentQuantity + quantity;

    if (
      newQuantity >
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

    let savedItem;

    if (existingItem) {
      savedItem =
        await updateCartItemQuantity(
          existingItem.id,
          newQuantity,
        );
    } else {
      savedItem =
        await createCartItem({
          cartId: cart.id,
          productId: product.id,
          quantity,
        });
    }

    if (!savedItem) {
      return {
        success: false,
        message:
          "Unable to add product to cart.",
      };
    }

    await touchCart(cart.id);

    return {
      success: true,
      message:
        existingItem
          ? "Cart quantity updated."
          : "Product added to cart.",
      quantity: savedItem.quantity,
    };
  } catch (error) {
    console.error(
      "Add to cart error:",
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
        "Unable to add product to cart.",
    };
  }
}