
import Link from "next/link";
import { asc, count, desc, eq, lte } from "drizzle-orm";

import { db } from "@/db";
import { inventoryTransactions, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/permissions";
import { InventoryAdjustmentForm } from "@/components/admin/inventory-adjustment-form";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminInventoryPage() {
  await requireAdmin();

  const [
    allProducts,
    lowStockResult,
    outOfStockResult,
    transactions,
  ] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        stockQuantity: products.stockQuantity,
        lowStockThreshold: products.lowStockThreshold,
        isActive: products.isActive,
      })
      .from(products)
      .orderBy(asc(products.name)),

    db
      .select({ value: count() })
      .from(products)
      .where(lte(products.stockQuantity, products.lowStockThreshold)),

    db
      .select({ value: count() })
      .from(products)
      .where(eq(products.stockQuantity, 0)),

    db
      .select({
        id: inventoryTransactions.id,
        productId: inventoryTransactions.productId,
        productName: products.name,
        type: inventoryTransactions.type,
        quantityChange: inventoryTransactions.quantityChange,
        previousQuantity: inventoryTransactions.previousQuantity,
        newQuantity: inventoryTransactions.newQuantity,
        reason: inventoryTransactions.reason,
        createdAt: inventoryTransactions.createdAt,
      })
      .from(inventoryTransactions)
      .innerJoin(
        products,
        eq(inventoryTransactions.productId, products.id),
      )
      .orderBy(desc(inventoryTransactions.createdAt))
      .limit(50),
  ]);

  const totalProducts = allProducts.length;
  const lowStock = lowStockResult[0]?.value ?? 0;
  const outOfStock = outOfStockResult[0]?.value ?? 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">Stock Management</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Inventory
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor product stock and record inventory changes.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="mt-2 text-3xl font-semibold">{totalProducts}</p>
          </div>
          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">Low Stock</p>
            <p className="mt-2 text-3xl font-semibold">{lowStock}</p>
          </div>
          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">Out of Stock</p>
            <p className="mt-2 text-3xl font-semibold">{outOfStock}</p>
          </div>
        </div>

        <section className="mb-8 overflow-hidden rounded-xl border">
          <div className="border-b p-5">
            <h2 className="text-lg font-semibold">Product Stock</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Stock levels are saved in your product records.
            </p>
          </div>

          {allProducts.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="font-medium">No products found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a product before managing its inventory.
              </p>
              <Link
                href="/admin/products/new"
                className="mt-4 inline-block underline underline-offset-4"
              >
                Create product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Threshold</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allProducts.map((product) => {
                    const isOutOfStock = product.stockQuantity === 0;
                    const isLowStock =
                      product.stockQuantity > 0 &&
                      product.stockQuantity <= product.lowStockThreshold;

                    return (
                      <tr key={product.id}>
                        <td className="px-4 py-4">
                          <p className="font-medium">{product.name}</p>
                          {!product.isActive && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Inactive product
                            </p>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {product.sku}
                        </td>
                        <td className="px-4 py-4 font-semibold">
                          {product.stockQuantity}
                        </td>
                        <td className="px-4 py-4">
                          {product.lowStockThreshold}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={
                              isOutOfStock
                                ? "rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800"
                                : isLowStock
                                  ? "rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800"
                                  : "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800"
                            }
                          >
                            {isOutOfStock
                              ? "Out of stock"
                              : isLowStock
                                ? "Low stock"
                                : "In stock"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <InventoryAdjustmentForm
                            productId={product.id}
                            productName={product.name}
                            currentQuantity={product.stockQuantity}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border">
          <div className="border-b p-5">
            <h2 className="text-lg font-semibold">Inventory History</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The 50 most recent recorded stock changes.
            </p>
          </div>

          {transactions.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="font-medium">No inventory history yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Stock adjustments and sales recorded by the inventory system will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Change</th>
                    <th className="px-4 py-3 font-medium">Previous</th>
                    <th className="px-4 py-3 font-medium">New</th>
                    <th className="px-4 py-3 font-medium">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-4 py-4">{transaction.productName}</td>
                      <td className="px-4 py-4">{transaction.type.replaceAll("_", " ")}</td>
                      <td className="px-4 py-4 font-medium">
                        {transaction.quantityChange > 0 ? "+" : ""}
                        {transaction.quantityChange}
                      </td>
                      <td className="px-4 py-4">{transaction.previousQuantity}</td>
                      <td className="px-4 py-4">{transaction.newQuantity}</td>
                      <td className="px-4 py-4">{transaction.reason || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
