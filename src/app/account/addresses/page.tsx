import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";

import {
  getAddressesByUserId,
} from "@/repositories/address.repository";

import { AddressForm } from "@/components/store/address-form";

export default async function AddressesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const addresses =
    await getAddressesByUserId(user.id);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-6 py-10">
        {/* Header */}

        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              Account
            </p>

            <h1 className="mt-2 text-3xl font-semibold">
              Shipping Addresses
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Manage your saved shipping addresses.
            </p>
          </div>

          <Link
            href="/checkout"
            className="shrink-0 text-sm font-medium hover:underline"
          >
            Back to Checkout
          </Link>
        </div>

        {/* Saved Addresses */}

        {addresses.length > 0 && (
          <section className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                Saved Addresses
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                You have {addresses.length}{" "}
                {addresses.length === 1
                  ? "saved address"
                  : "saved addresses"}.
              </p>
            </div>

            <div className="space-y-4">
              {addresses.map((address) => (
                <article
                  key={address.id}
                  className="rounded-xl border p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Address Information */}

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold">
                          {address.fullName}
                        </h3>

                        {address.isDefault && (
                          <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">
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

                        {address.landmark && (
                          <>
                            <br />

                            <span className="text-muted-foreground">
                              Landmark:{" "}
                              {address.landmark}
                            </span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Address Action */}

                    {!address.isDefault && (
                      <Link
                        href={`/checkout?addressId=${address.id}`}
                        className="shrink-0 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                      >
                        Use This Address
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Add New Address */}

        <section className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">
            Add New Address
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            This address will be available during checkout.
          </p>

          <div className="mt-6">
            <AddressForm
              submitLabel="Save Address"
            />
          </div>
        </section>
      </section>
    </main>
  );
}