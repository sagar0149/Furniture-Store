import { count, eq, sum } from "drizzle-orm";

import { db } from "@/db";

import {
  users,
  products,
  orders,
} from "@/db/schema";

export async function getDashboardStats() {
  const [
    productResult,
    customerResult,
    orderResult,
    revenueResult,
  ] = await Promise.all([
    db
      .select({
        count: count(),
      })
      .from(products)
      .where(eq(products.isActive, true)),

    db
      .select({
        count: count(),
      })
      .from(users)
      .where(eq(users.role, "CUSTOMER")),

    db
      .select({
        count: count(),
      })
      .from(orders),

    db
      .select({
        total: sum(orders.totalAmount),
      })
      .from(orders),
  ]);

  return {
    products: Number(
      productResult[0]?.count ?? 0,
    ),

    customers: Number(
      customerResult[0]?.count ?? 0,
    ),

    orders: Number(
      orderResult[0]?.count ?? 0,
    ),

    revenue: Number(
      revenueResult[0]?.total ?? 0,
    ),
  };
}