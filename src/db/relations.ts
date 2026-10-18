import { relations } from "drizzle-orm";

import { users } from "./schema/users";
import { addresses } from "./schema/addresses";
import { categories } from "./schema/categories";
import { products } from "./schema/products";
import { productImages } from "./schema/product-images";

import { discounts } from "./schema/discounts";
import { discountProducts } from "./schema/discount-products";
import { discountCategories } from "./schema/discount-categories";

import { carts } from "./schema/carts";
import { cartItems } from "./schema/cart-items";

import { wishlists } from "./schema/wishlists";
import { wishlistItems } from "./schema/wishlist-items";

import { orders } from "./schema/orders";
import { orderItems } from "./schema/order-items";

import { storeSettings } from "./schema/store-settings";
import { socialLinks } from "./schema/social-links";
import { businessHours } from "./schema/business-hours";
import { footerSections } from "./schema/footer-sections";
import { shippingSettings } from "./schema/shipping-settings";

import { promotions } from "./schema/promotions";
import { promotionProducts } from "./schema/promotion-products";

import { reviews } from "./schema/reviews";
import { newsletterSubscribers } from "./schema/newsletter-subscribers";

import { paymentTransactions } from "./schema/payment-transactions";
import { inventoryTransactions } from "./schema/inventory-transactions";
import { adminAuditLogs } from "./schema/admin-audit-logs";

/* =========================
   USERS
========================= */

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  cart: many(carts),
  wishlist: many(wishlists),
  orders: many(orders),
  reviews: many(reviews),
  adminAuditLogs: many(adminAuditLogs),
}));

/* =========================
   ADDRESSES
========================= */

export const addressesRelations = relations(
  addresses,
  ({ one }) => ({
    user: one(users, {
      fields: [addresses.userId],
      references: [users.id],
    }),
  }),
);

/* =========================
   CATEGORIES
========================= */

export const categoriesRelations = relations(
  categories,
  ({ many }) => ({
    products: many(products),
    discountCategories: many(discountCategories),
  }),
);

/* =========================
   PRODUCTS
========================= */

export const productsRelations = relations(
  products,
  ({ one, many }) => ({
    category: one(categories, {
      fields: [products.categoryId],
      references: [categories.id],
    }),

    images: many(productImages),

    discountProducts: many(discountProducts),

    cartItems: many(cartItems),

    wishlistItems: many(wishlistItems),

    orderItems: many(orderItems),

    reviews: many(reviews),

    promotionProducts: many(promotionProducts),

    inventoryTransactions: many(inventoryTransactions),
  }),
);

/* =========================
   PRODUCT IMAGES
========================= */

export const productImagesRelations = relations(
  productImages,
  ({ one }) => ({
    product: one(products, {
      fields: [productImages.productId],
      references: [products.id],
    }),
  }),
);

/* =========================
   DISCOUNTS
========================= */

export const discountsRelations = relations(
  discounts,
  ({ many }) => ({
    discountProducts: many(discountProducts),
    discountCategories: many(discountCategories),
  }),
);

/* =========================
   DISCOUNT PRODUCTS
========================= */

export const discountProductsRelations = relations(
  discountProducts,
  ({ one }) => ({
    discount: one(discounts, {
      fields: [discountProducts.discountId],
      references: [discounts.id],
    }),

    product: one(products, {
      fields: [discountProducts.productId],
      references: [products.id],
    }),
  }),
);

/* =========================
   DISCOUNT CATEGORIES
========================= */

export const discountCategoriesRelations =
  relations(discountCategories, ({ one }) => ({
    discount: one(discounts, {
      fields: [discountCategories.discountId],
      references: [discounts.id],
    }),

    category: one(categories, {
      fields: [discountCategories.categoryId],
      references: [categories.id],
    }),
  }));

/* =========================
   CARTS
========================= */

export const cartsRelations = relations(
  carts,
  ({ one, many }) => ({
    user: one(users, {
      fields: [carts.userId],
      references: [users.id],
    }),

    items: many(cartItems),
  }),
);

/* =========================
   CART ITEMS
========================= */

export const cartItemsRelations = relations(
  cartItems,
  ({ one }) => ({
    cart: one(carts, {
      fields: [cartItems.cartId],
      references: [carts.id],
    }),

    product: one(products, {
      fields: [cartItems.productId],
      references: [products.id],
    }),
  }),
);

/* =========================
   WISHLISTS
========================= */

export const wishlistsRelations = relations(
  wishlists,
  ({ one, many }) => ({
    user: one(users, {
      fields: [wishlists.userId],
      references: [users.id],
    }),

    items: many(wishlistItems),
  }),
);

/* =========================
   WISHLIST ITEMS
========================= */

export const wishlistItemsRelations = relations(
  wishlistItems,
  ({ one }) => ({
    wishlist: one(wishlists, {
      fields: [wishlistItems.wishlistId],
      references: [wishlists.id],
    }),

    product: one(products, {
      fields: [wishlistItems.productId],
      references: [products.id],
    }),
  }),
);

/* =========================
   ORDERS
========================= */

export const ordersRelations = relations(
  orders,
  ({ one, many }) => ({
    user: one(users, {
      fields: [orders.userId],
      references: [users.id],
    }),

    items: many(orderItems),

    paymentTransactions: many(paymentTransactions),

    inventoryTransactions: many(inventoryTransactions),
  }),
);

/* =========================
   ORDER ITEMS
========================= */

export const orderItemsRelations = relations(
  orderItems,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderItems.orderId],
      references: [orders.id],
    }),

    product: one(products, {
      fields: [orderItems.productId],
      references: [products.id],
    }),
  }),
);

/* =========================
   STORE SETTINGS
========================= */

export const storeSettingsRelations = relations(
  storeSettings,
  () => ({}),
);

/* =========================
   SOCIAL LINKS
========================= */

export const socialLinksRelations = relations(
  socialLinks,
  () => ({}),
);

/* =========================
   BUSINESS HOURS
========================= */

export const businessHoursRelations = relations(
  businessHours,
  () => ({}),
);

/* =========================
   FOOTER SECTIONS
========================= */

export const footerSectionsRelations = relations(
  footerSections,
  () => ({}),
);

/* =========================
   SHIPPING SETTINGS
========================= */

export const shippingSettingsRelations = relations(
  shippingSettings,
  () => ({}),
);

/* =========================
   PROMOTIONS
========================= */

export const promotionsRelations = relations(
  promotions,
  ({ many }) => ({
    promotionProducts: many(promotionProducts),
  }),
);

/* =========================
   PROMOTION PRODUCTS
========================= */

export const promotionProductsRelations =
  relations(promotionProducts, ({ one }) => ({
    promotion: one(promotions, {
      fields: [promotionProducts.promotionId],
      references: [promotions.id],
    }),

    product: one(products, {
      fields: [promotionProducts.productId],
      references: [products.id],
    }),
  }));

/* =========================
   REVIEWS
========================= */

export const reviewsRelations = relations(
  reviews,
  ({ one }) => ({
    product: one(products, {
      fields: [reviews.productId],
      references: [products.id],
    }),

    user: one(users, {
      fields: [reviews.userId],
      references: [users.id],
    }),
  }),
);

/* =========================
   NEWSLETTER
========================= */

export const newsletterSubscribersRelations =
  relations(newsletterSubscribers, () => ({}));

/* =========================
   PAYMENT TRANSACTIONS
========================= */

export const paymentTransactionsRelations =
  relations(paymentTransactions, ({ one }) => ({
    order: one(orders, {
      fields: [paymentTransactions.orderId],
      references: [orders.id],
    }),
  }));

/* =========================
   INVENTORY TRANSACTIONS
========================= */

export const inventoryTransactionsRelations =
  relations(inventoryTransactions, ({ one }) => ({
    product: one(products, {
      fields: [inventoryTransactions.productId],
      references: [products.id],
    }),

    order: one(orders, {
      fields: [inventoryTransactions.orderId],
      references: [orders.id],
    }),
  }));

/* =========================
   ADMIN AUDIT LOGS
========================= */

export const adminAuditLogsRelations =
  relations(adminAuditLogs, ({ one }) => ({
    adminUser: one(users, {
      fields: [adminAuditLogs.adminUserId],
      references: [users.id],
    }),
  }));