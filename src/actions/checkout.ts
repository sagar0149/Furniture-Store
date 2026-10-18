"use server";

import {
  requireUser,
} from "@/lib/auth/permissions";

import {
  getUserAddressById,
} from "@/repositories/address.repository";

import {
  getCartByUserId,
  getCartItems,
} from "@/repositories/cart.repository";

import {
  createOrder,
  createOrderItem,
  getOrderByNumber,
} from "@/repositories/order.repository";

import {
  decreaseProductStock,
} from "@/repositories/inventory.repository";

import {
  getStoreCurrency,
} from "@/repositories/store-settings.repository";

import {
  db,
} from "@/db";

import {
  cartItems,
} from "@/db/schema";

import {
  eq,
} from "drizzle-orm";

function generateOrderNumber() {
  const timestamp =
    Date.now().toString(36).toUpperCase();

  const random =
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

  return `FS-${timestamp}-${random}`;
}

export type CheckoutResult = {
  success: boolean;
  message: string;
  orderId?: string;
  orderNumber?: string;
};

export async function placeOrderAction(
  addressId: string,
): Promise<CheckoutResult> {
  try {
    const user = await requireUser();

    /*
     * Get the currency configured by the
     * store owner.
     *
     * Examples:
     * USD, NPR, INR, EUR, GBP
     */
    const currency =
      await getStoreCurrency();

    if (!currency) {
      return {
        success: false,
        message:
          "Store currency is not configured.",
      };
    }

    if (!addressId) {
      return {
        success: false,
        message:
          "Please select a shipping address.",
      };
    }

    /*
     * Verify that the selected address
     * belongs to the logged-in user.
     */
    const address =
      await getUserAddressById(
        user.id,
        addressId,
      );

    if (!address) {
      return {
        success: false,
        message:
          "The selected shipping address was not found.",
      };
    }

    /*
     * Get the user's cart.
     */
    const cart =
      await getCartByUserId(user.id);

    if (!cart) {
      return {
        success: false,
        message:
          "Your cart is empty.",
      };
    }

    /*
     * Get current cart contents.
     */
    const items =
      await getCartItems(cart.id);

    if (items.length === 0) {
      return {
        success: false,
        message:
          "Your cart is empty.",
      };
    }

    /*
     * Recalculate the subtotal on the server.
     *
     * Never trust totals supplied by the
     * browser.
     */
    let subtotal = 0;

    for (const item of items) {
      const product =
        item.product;

      /*
       * Make sure the product is still
       * available.
       */
      if (!product.isActive) {
        return {
          success: false,
          message:
            `${product.name} is no longer available.`,
        };
      }

      /*
       * Make sure the product is in stock.
       */
      if (
        product.stockQuantity <= 0
      ) {
        return {
          success: false,
          message:
            `${product.name} is currently out of stock.`,
        };
      }

      /*
       * Make sure the requested quantity
       * is available.
       */
      if (
        item.cartItem.quantity >
        product.stockQuantity
      ) {
        return {
          success: false,
          message:
            `Only ${product.stockQuantity} ${product.name} item${
              product.stockQuantity === 1
                ? ""
                : "s"
            } available.`,
        };
      }

      /*
       * Use sale price when available.
       */
      const price =
        Number(
          product.salePrice ??
            product.regularPrice,
        );

      /*
       * Validate the product price.
       */
      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        return {
          success: false,
          message:
            `Invalid price for ${product.name}.`,
        };
      }

      subtotal +=
        price *
        item.cartItem.quantity;
    }

    /*
     * Round monetary values to two decimals.
     */
    subtotal =
      Math.round(
        subtotal * 100,
      ) / 100;

    /*
     * Current checkout configuration.
     *
     * These can later be connected to:
     *
     * - Shipping settings
     * - Discount system
     * - Tax system
     */
    const discountAmount = 0;
    const shippingAmount = 0;
    const taxAmount = 0;

    const totalAmount =
      Math.round(
        (
          subtotal -
          discountAmount +
          shippingAmount +
          taxAmount
        ) * 100,
      ) / 100;

    /*
     * Generate a unique order number.
     */
    let orderNumber =
      generateOrderNumber();

    /*
     * Protect against an extremely
     * unlikely order-number collision.
     */
    let existingOrder =
      await getOrderByNumber(
        orderNumber,
      );

    while (existingOrder) {
      orderNumber =
        generateOrderNumber();

      existingOrder =
        await getOrderByNumber(
          orderNumber,
        );
    }

    /*
     * Create the order.
     *
     * IMPORTANT:
     *
     * The currency comes from store settings
     * instead of being hardcoded to USD.
     *
     * This means:
     *
     * USA store    -> USD
     * Nepal store  -> NPR
     * India store  -> INR
     * UK store     -> GBP
     * Europe store -> EUR
     */
    const order =
      await createOrder({
        orderNumber,

        userId:
          user.id,

        customerName:
          user.name,

        customerEmail:
          user.email,

        customerPhone:
          user.phone ??
          address.phone,

        shippingFullName:
          address.fullName,

        shippingPhone:
          address.phone,

        shippingAddressLine1:
          address.addressLine1,

        shippingAddressLine2:
          address.addressLine2 ??
          undefined,

        shippingCity:
          address.city,

        shippingState:
          address.state,

        shippingPostalCode:
          address.postalCode,

        shippingCountry:
          address.country,

        shippingLandmark:
          address.landmark ??
          undefined,

        /*
         * Dynamic store currency.
         */
        currency,

        subtotal:
          subtotal.toFixed(2),

        discountAmount:
          discountAmount.toFixed(2),

        shippingAmount:
          shippingAmount.toFixed(2),

        taxAmount:
          taxAmount.toFixed(2),

        totalAmount:
          totalAmount.toFixed(2),

        placedAt:
          new Date(),
      });

    if (!order) {
      return {
        success: false,
        message:
          "Unable to create your order.",
      };
    }

    /*
     * Create order-item snapshots and
     * decrease inventory.
     */
    try {
      for (const item of items) {
        const product =
          item.product;

        const quantity =
          item.cartItem.quantity;

        const unitPrice =
          Number(
            product.salePrice ??
              product.regularPrice,
          );

        const finalPrice =
          Math.round(
            unitPrice *
              quantity *
              100,
          ) / 100;

        /*
         * Store a snapshot of the product
         * information at the time of purchase.
         */
        const orderItem =
          await createOrderItem({
            orderId:
              order.id,

            productId:
              product.id,

            productNameSnapshot:
              product.name,

            skuSnapshot:
              product.sku,

            quantity,

            unitPrice:
              unitPrice.toFixed(2),

            discountAmount:
              "0.00",

            finalPrice:
              finalPrice.toFixed(2),
          });

        if (!orderItem) {
          throw new Error(
            `Unable to create order item for ${product.name}.`,
          );
        }

        /*
         * Decrease inventory.
         */
        await decreaseProductStock(
          db,
          {
            productId:
              product.id,

            orderId:
              order.id,

            quantity,

            reason:
              `Sale for order ${order.orderNumber}`,
          },
        );
      }
    } catch (error) {
      console.error(
        "Order item/inventory error:",
        error,
      );

      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to complete your order.",
      };
    }

    /*
     * Clear the cart only after all
     * order items and inventory operations
     * succeed.
     */
    await db
      .delete(cartItems)
      .where(
        eq(
          cartItems.cartId,
          cart.id,
        ),
      );

    /*
     * Return the created order.
     */
    return {
      success: true,

      message:
        "Your order has been placed successfully.",

      orderId:
        order.id,

      orderNumber:
        order.orderNumber,
    };
  } catch (error) {
    console.error(
      "Place order error:",
      error,
    );

    if (error instanceof Error) {
      return {
        success: false,
        message:
          error.message,
      };
    }

    return {
      success: false,
      message:
        "Unable to place your order.",
    };
  }
}