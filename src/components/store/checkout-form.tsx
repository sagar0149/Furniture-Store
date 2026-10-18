"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { placeOrderAction } from "@/actions/checkout";

type Address = {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark: string | null;
  isDefault: boolean;
};

type CheckoutFormProps = {
  addresses: Address[];
};

export function CheckoutForm({
  addresses,
}: CheckoutFormProps) {
  const router = useRouter();

  const defaultAddress =
    addresses.find(
      (address) => address.isDefault,
    ) ?? addresses[0];

  const [selectedAddressId, setSelectedAddressId] =
    useState(
      defaultAddress?.id ?? "",
    );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!selectedAddressId) {
      setError(
        "Please select a shipping address.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result =
        await placeOrderAction(
          selectedAddressId,
        );

      if (!result.success) {
        setError(
          result.message ||
            "Unable to place your order.",
        );
        return;
      }

      /*
       * The order was successfully created.
       *
       * Redirect to the order confirmation
       * page once that route is available.
       *
       * For now, send the customer back to
       * the cart so we can verify that it
       * has been cleared.
       */
      if (result.orderId) {
  router.push(`/orders/${result.orderId}`);
  router.refresh();
} else {
  router.push("/cart");
  router.refresh();
}
    } catch (error) {
      console.error(
        "Checkout submission error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to place your order.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6"
    >
      <div className="space-y-4">
        {addresses.map((address) => {
          const selected =
            selectedAddressId ===
            address.id;

          return (
            <label
              key={address.id}
              className={`block cursor-pointer rounded-xl border p-4 transition-colors ${
                selected
                  ? "border-foreground bg-muted/40"
                  : "hover:bg-muted/20"
              }`}
            >
              <div className="flex gap-4">
                <input
                  type="radio"
                  name="shippingAddress"
                  value={address.id}
                  checked={selected}
                  onChange={() =>
                    setSelectedAddressId(
                      address.id,
                    )
                  }
                  className="mt-1 h-4 w-4"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">
                      {address.fullName}
                    </p>

                    {address.isDefault && (
                      <span className="rounded-full bg-foreground px-2 py-0.5 text-xs font-medium text-background">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {address.phone}
                  </p>

                  <p className="mt-3 text-sm leading-6">
                    {address.addressLine1}
                    {address.addressLine2 && (
                      <>
                        <br />
                        {address.addressLine2}
                      </>
                    )}
                    <br />
                    {address.city},{" "}
                    {address.state}{" "}
                    {address.postalCode}
                    <br />
                    {address.country}
                  </p>

                  {address.landmark && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Landmark:{" "}
                      {address.landmark}
                    </p>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={
          isSubmitting ||
          !selectedAddressId
        }
        className="mt-6 flex h-12 w-full items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? "Placing Order..."
          : "Place Order"}
      </button>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Your order total will be calculated
        securely on the server.
      </p>
    </form>
  );
}