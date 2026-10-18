import {
  and,
  asc,
  eq,
} from "drizzle-orm";

import { db } from "@/db";

import {
  carts,
  cartItems,
  products,
  productImages,
} from "@/db/schema";

/**
 * Get the current user's cart.
 */
export async function getCartByUserId(
  userId: string,
) {
  const result = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Create a cart for a user.
 */
export async function createCart(
  userId: string,
) {
  const result = await db
    .insert(carts)
    .values({
      userId,
    })
    .returning();

  return result[0] ?? null;
}

/**
 * Get an existing cart or create one.
 */
export async function getOrCreateCart(
  userId: string,
) {
  const existingCart =
    await getCartByUserId(userId);

  if (existingCart) {
    return existingCart;
  }

  return createCart(userId);
}

/**
 * Get a single cart item.
 */
export async function getCartItem(
  cartId: string,
  productId: string,
) {
  const result = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.cartId, cartId),
        eq(
          cartItems.productId,
          productId,
        ),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Add a new item to the cart.
 */
export async function createCartItem(
  data: {
    cartId: string;
    productId: string;
    quantity: number;
  },
) {
  const result = await db
    .insert(cartItems)
    .values({
      cartId: data.cartId,
      productId: data.productId,
      quantity: data.quantity,
    })
    .returning();

  return result[0] ?? null;
}

/**
 * Update cart item quantity.
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
) {
  const result = await db
    .update(cartItems)
    .set({
      quantity,
      updatedAt: new Date(),
    })
    .where(
      eq(cartItems.id, cartItemId),
    )
    .returning();

  return result[0] ?? null;
}

/**
 * Delete a cart item.
 */
export async function deleteCartItem(
  cartItemId: string,
) {
  const result = await db
    .delete(cartItems)
    .where(
      eq(cartItems.id, cartItemId),
    )
    .returning({
      id: cartItems.id,
    });

  return result[0] ?? null;
}

/**
 * Get all cart items with product
 * and primary-image information.
 */
export async function getCartItems(
  cartId: string,
) {
  return db
    .select({
      cartItem: cartItems,
      product: products,
      image: productImages,
    })
    .from(cartItems)
    .innerJoin(
      products,
      eq(
        cartItems.productId,
        products.id,
      ),
    )
    .leftJoin(
      productImages,
      and(
        eq(
          productImages.productId,
          products.id,
        ),
        eq(
          productImages.isPrimary,
          true,
        ),
      ),
    )
    .where(
      eq(cartItems.cartId, cartId),
    )
    .orderBy(
      asc(cartItems.createdAt),
    );
}

/**
 * Update the cart timestamp.
 */
export async function touchCart(
  cartId: string,
) {
  const result = await db
    .update(carts)
    .set({
      updatedAt: new Date(),
    })
    .where(eq(carts.id, cartId))
    .returning();

  return result[0] ?? null;
}