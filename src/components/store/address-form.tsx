"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createAddressAction,
} from "@/actions/address";

type AddressFormProps = {
  initialData?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    landmark?: string | null;
    isDefault?: boolean;
  };

  submitLabel?: string;

  onCancel?: () => void;
};

export function AddressForm({
  initialData,
  submitLabel = "Save Address",
  onCancel,
}: AddressFormProps) {
  const router = useRouter();

  const [fullName, setFullName] =
    useState(
      initialData?.fullName ?? "",
    );

  const [phone, setPhone] =
    useState(
      initialData?.phone ?? "",
    );

  const [addressLine1, setAddressLine1] =
    useState(
      initialData?.addressLine1 ?? "",
    );

  const [addressLine2, setAddressLine2] =
    useState(
      initialData?.addressLine2 ?? "",
    );

  const [city, setCity] =
    useState(
      initialData?.city ?? "",
    );

  const [state, setState] =
    useState(
      initialData?.state ?? "",
    );

  const [postalCode, setPostalCode] =
    useState(
      initialData?.postalCode ?? "",
    );

  const [country, setCountry] =
    useState(
      initialData?.country ?? "India",
    );

  const [landmark, setLandmark] =
    useState(
      initialData?.landmark ?? "",
    );

  const [isDefault, setIsDefault] =
    useState(
      initialData?.isDefault ?? false,
    );

  const [error, setError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!fullName.trim()) {
      setError(
        "Full name is required.",
      );
      return;
    }

    if (!phone.trim()) {
      setError(
        "Phone number is required.",
      );
      return;
    }

    if (!addressLine1.trim()) {
      setError(
        "Address line 1 is required.",
      );
      return;
    }

    if (!city.trim()) {
      setError(
        "City is required.",
      );
      return;
    }

    if (!state.trim()) {
      setError(
        "State is required.",
      );
      return;
    }

    if (!postalCode.trim()) {
      setError(
        "Postal code is required.",
      );
      return;
    }

    if (!country.trim()) {
      setError(
        "Country is required.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const result =
        await createAddressAction({
          fullName:
            fullName.trim(),

          phone:
            phone.trim(),

          addressLine1:
            addressLine1.trim(),

          addressLine2:
            addressLine2.trim(),

          city:
            city.trim(),

          state:
            state.trim(),

          postalCode:
            postalCode.trim(),

          country:
            country.trim(),

          landmark:
            landmark.trim(),

          isDefault,
        });

      if (!result.success) {
        setError(
          result.message,
        );
        return;
      }

      /*
       * Clear the form after successful
       * address creation.
       */
      setFullName("");
      setPhone("");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setState("");
      setPostalCode("");
      setCountry("India");
      setLandmark("");
      setIsDefault(false);

      /*
       * Refresh the Server Component so
       * the newly created address appears
       * immediately.
       */
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save address.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Full Name */}

        <div className="sm:col-span-2">
          <label
            htmlFor="fullName"
            className="text-sm font-medium"
          >
            Full Name
          </label>

          <input
            id="fullName"
            value={fullName}
            onChange={(event) =>
              setFullName(
                event.target.value,
              )
            }
            placeholder="Enter full name"
            className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Phone */}

        <div>
          <label
            htmlFor="phone"
            className="text-sm font-medium"
          >
            Phone Number
          </label>

          <input
            id="phone"
            value={phone}
            onChange={(event) =>
              setPhone(
                event.target.value,
              )
            }
            placeholder="Enter phone number"
            className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Country */}

        <div>
          <label
            htmlFor="country"
            className="text-sm font-medium"
          >
            Country
          </label>

          <input
            id="country"
            value={country}
            onChange={(event) =>
              setCountry(
                event.target.value,
              )
            }
            placeholder="Country"
            className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Address Line 1 */}

        <div className="sm:col-span-2">
          <label
            htmlFor="addressLine1"
            className="text-sm font-medium"
          >
            Address Line 1
          </label>

          <input
            id="addressLine1"
            value={addressLine1}
            onChange={(event) =>
              setAddressLine1(
                event.target.value,
              )
            }
            placeholder="House number, street"
            className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Address Line 2 */}

        <div className="sm:col-span-2">
          <label
            htmlFor="addressLine2"
            className="text-sm font-medium"
          >
            Address Line 2
            <span className="ml-1 text-muted-foreground">
              (Optional)
            </span>
          </label>

          <input
            id="addressLine2"
            value={addressLine2}
            onChange={(event) =>
              setAddressLine2(
                event.target.value,
              )
            }
            placeholder="Apartment, floor, building"
            className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* City */}

        <div>
          <label
            htmlFor="city"
            className="text-sm font-medium"
          >
            City
          </label>

          <input
            id="city"
            value={city}
            onChange={(event) =>
              setCity(
                event.target.value,
              )
            }
            placeholder="City"
            className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* State */}

        <div>
          <label
            htmlFor="state"
            className="text-sm font-medium"
          >
            State
          </label>

          <input
            id="state"
            value={state}
            onChange={(event) =>
              setState(
                event.target.value,
              )
            }
            placeholder="State"
            className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Postal Code */}

        <div>
          <label
            htmlFor="postalCode"
            className="text-sm font-medium"
          >
            Postal Code
          </label>

          <input
            id="postalCode"
            value={postalCode}
            onChange={(event) =>
              setPostalCode(
                event.target.value,
              )
            }
            placeholder="Postal code"
            className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Landmark */}

        <div>
          <label
            htmlFor="landmark"
            className="text-sm font-medium"
          >
            Landmark
            <span className="ml-1 text-muted-foreground">
              (Optional)
            </span>
          </label>

          <input
            id="landmark"
            value={landmark}
            onChange={(event) =>
              setLandmark(
                event.target.value,
              )
            }
            placeholder="Nearby landmark"
            className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Default Address */}

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(event) =>
            setIsDefault(
              event.target.checked,
            )
          }
          className="h-4 w-4"
        />

        <span className="text-sm">
          Make this my default address
        </span>
      </label>

      {/* Buttons */}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : submitLabel}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-11 rounded-md border px-5 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}