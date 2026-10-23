
"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createDiscountAction,
  updateDiscountAction,
  type DiscountActionResult,
} from "@/actions/discounts";

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
};

type CategoryOption = {
  id: string;
  name: string;
};

type DiscountData = {
  id: string;
  name: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: string;
  startAt: Date;
  endAt: Date;
  enabled: boolean;
  productIds: string[];
  categoryIds: string[];
};

type DiscountFormProps = {
  products: ProductOption[];
  categories: CategoryOption[];
  discount?: DiscountData;
  currency: string;
};

function toLocalDateTime(value?: Date) {
  if (!value) return "";

  const date = new Date(value);
  const offset = date.getTimezoneOffset();

  return new Date(
    date.getTime() - offset * 60_000,
  )
    .toISOString()
    .slice(0, 16);
}

const initialState: DiscountActionResult | null =
  null;

export function DiscountForm({
  products,
  categories,
  discount,
  currency,
}: DiscountFormProps) {
  const action = discount
    ? updateDiscountAction.bind(
        null,
        discount.id,
      )
    : createDiscountAction;

  const [state, formAction, pending] =
    useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state && (
        <div
          role="status"
          className={`rounded-xl border p-4 text-sm font-medium ${
            state.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-950">
            General information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Set a clear name and description for this discount.
          </p>
        </div>

        <div className="grid gap-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Discount name *
            </span>
            <input
              name="name"
              required
              maxLength={150}
              defaultValue={discount?.name ?? ""}
              placeholder="e.g. Summer Furniture Sale"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Description
            </span>
            <textarea
              name="description"
              rows={3}
              defaultValue={discount?.description ?? ""}
              placeholder="Describe this offer..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-950">
            Discount value
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose how much customers save.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Discount type *
            </span>
            <select
              name="type"
              defaultValue={discount?.type ?? "PERCENTAGE"}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            >
              <option value="PERCENTAGE">
                Percentage (%)
              </option>
              <option value="FIXED_AMOUNT">
                Fixed amount ({currency})
              </option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Discount value *
            </span>
            <input
              name="value"
              type="number"
              required
              min="0.01"
              max="9999999999.99"
              step="0.01"
              defaultValue={discount?.value ?? ""}
              placeholder="10"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </label>
        </div>

        <p className="mt-4 rounded-xl bg-cyan-50 p-4 text-sm text-cyan-900">
          Percentage discounts cannot exceed 100%. Fixed
          discounts use the store currency, {currency}.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-950">
            Schedule
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Configure when the discount becomes valid.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Starts at *
            </span>
            <input
              type="datetime-local"
              name="startAt"
              required
              defaultValue={toLocalDateTime(discount?.startAt)}
              className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Ends at *
            </span>
            <input
              type="datetime-local"
              name="endAt"
              required
              defaultValue={toLocalDateTime(discount?.endAt)}
              className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </label>
        </div>

        <label className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 p-4">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={discount?.enabled ?? true}
            className="mt-1 h-4 w-4 accent-cyan-600"
          />
          <span>
            <span className="block text-sm font-semibold text-slate-800">
              Enable discount
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              The discount can be used only during its
              scheduled period.
            </span>
          </span>
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-950">
            Product targeting
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Leave both lists empty to apply this discount
            store-wide. Otherwise, matching either a selected
            product or selected category makes it eligible.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <fieldset className="min-w-0">
            <legend className="mb-3 text-sm font-semibold text-slate-700">
              Selected products ({products.length} available)
            </legend>

            <div className="max-h-72 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-3">
              {products.length === 0 ? (
                <p className="p-3 text-sm text-slate-500">
                  No products available.
                </p>
              ) : (
                products.map((product) => (
                  <label
                    key={product.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      name="productIds"
                      value={product.id}
                      defaultChecked={
                        discount?.productIds.includes(product.id) ??
                        false
                      }
                      className="mt-1 h-4 w-4 accent-cyan-600"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-800">
                        {product.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        SKU: {product.sku}
                      </span>
                    </span>
                  </label>
                ))
              )}
            </div>
          </fieldset>

          <fieldset className="min-w-0">
            <legend className="mb-3 text-sm font-semibold text-slate-700">
              Selected categories ({categories.length} available)
            </legend>

            <div className="max-h-72 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-3">
              {categories.length === 0 ? (
                <p className="p-3 text-sm text-slate-500">
                  No categories available.
                </p>
              ) : (
                categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      name="categoryIds"
                      value={category.id}
                      defaultChecked={
                        discount?.categoryIds.includes(category.id) ??
                        false
                      }
                      className="h-4 w-4 accent-cyan-600"
                    />
                    <span className="text-sm font-medium text-slate-800">
                      {category.name}
                    </span>
                  </label>
                ))
              )}
            </div>
          </fieldset>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/discounts"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-900/15 transition hover:from-cyan-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? "Saving..."
            : discount
              ? "Save Changes"
              : "Create Discount"}
        </button>
      </div>
    </form>
  );
}
