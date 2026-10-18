"use client";

import { useState } from "react";

type StoreSettings = {
  storeName: string;
  tagline: string | null;
  description: string | null;

  logoUrl: string | null;
  faviconUrl: string | null;

  country: string | null;
  currency: string;
  language: string;
  timezone: string;

  primaryEmail: string | null;
  secondaryEmail: string | null;
  phone: string | null;
  whatsapp: string | null;
  customerSupportPhone: string | null;

  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;

  latitude: string | null;
  longitude: string | null;
  googleMapsUrl: string | null;

  footerDescription: string | null;
  copyrightText: string | null;

  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;

  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
};

type StoreInformationFormProps = {
  settings: StoreSettings;
};

type FormState = {
  status: "idle" | "saving" | "success" | "error";
  message: string;
};

export function StoreInformationForm({
  settings,
}: StoreInformationFormProps) {
  const [form, setForm] = useState({
    storeName: settings.storeName ?? "",
    tagline: settings.tagline ?? "",
    description: settings.description ?? "",

    logoUrl: settings.logoUrl ?? "",
    faviconUrl: settings.faviconUrl ?? "",

    country: settings.country ?? "",
    currency: settings.currency ?? "USD",
    language: settings.language ?? "en",
    timezone: settings.timezone ?? "UTC",

    primaryEmail: settings.primaryEmail ?? "",
    secondaryEmail:
      settings.secondaryEmail ?? "",
    phone: settings.phone ?? "",
    whatsapp: settings.whatsapp ?? "",
    customerSupportPhone:
      settings.customerSupportPhone ?? "",

    addressLine1:
      settings.addressLine1 ?? "",
    addressLine2:
      settings.addressLine2 ?? "",
    city: settings.city ?? "",
    state: settings.state ?? "",
    postalCode:
      settings.postalCode ?? "",

    latitude: settings.latitude ?? "",
    longitude: settings.longitude ?? "",
    googleMapsUrl:
      settings.googleMapsUrl ?? "",

    footerDescription:
      settings.footerDescription ?? "",
    copyrightText:
      settings.copyrightText ?? "",

    seoTitle: settings.seoTitle ?? "",
    seoDescription:
      settings.seoDescription ?? "",
    seoKeywords:
      settings.seoKeywords ?? "",

    ogTitle: settings.ogTitle ?? "",
    ogDescription:
      settings.ogDescription ?? "",
    ogImageUrl:
      settings.ogImageUrl ?? "",
  });

  const [state, setState] =
    useState<FormState>({
      status: "idle",
      message: "",
    });

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setState({
      status: "saving",
      message: "Saving changes...",
    });

    try {
      const response = await fetch(
        "/api/admin/settings/store-information",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ??
            "Unable to save store settings.",
        );
      }

      setState({
        status: "success",
        message:
          "Store information saved successfully.",
      });
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to save store settings.",
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Store Identity */}

      <section className="rounded-xl border p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Store Identity
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure the name and basic identity
            of your store.
          </p>
        </div>

        <div className="grid gap-5">
          <Field
            label="Store Name"
            required
            value={form.storeName}
            onChange={(value) =>
              updateField(
                "storeName",
                value,
              )
            }
            placeholder="UrbanNest Furniture"
          />

          <Field
            label="Tagline"
            value={form.tagline}
            onChange={(value) =>
              updateField(
                "tagline",
                value,
              )
            }
            placeholder="Furniture Designed for Modern Living"
          />

          <TextareaField
            label="Description"
            value={form.description}
            onChange={(value) =>
              updateField(
                "description",
                value,
              )
            }
            rows={5}
            placeholder="Describe your furniture store..."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Logo URL"
              value={form.logoUrl}
              onChange={(value) =>
                updateField(
                  "logoUrl",
                  value,
                )
              }
              placeholder="https://..."
            />

            <Field
              label="Favicon URL"
              value={form.faviconUrl}
              onChange={(value) =>
                updateField(
                  "faviconUrl",
                  value,
                )
              }
              placeholder="https://..."
            />
          </div>
        </div>
      </section>

      {/* Localization */}

      <section className="rounded-xl border p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Localization
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure the store country, currency,
            language, and timezone.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Country"
            value={form.country}
            onChange={(value) =>
              updateField(
                "country",
                value,
              )
            }
            placeholder="India"
          />

          <Field
            label="Currency"
            required
            value={form.currency}
            onChange={(value) =>
              updateField(
                "currency",
                value.toUpperCase(),
              )
            }
            placeholder="INR"
            maxLength={3}
          />

          <Field
            label="Language"
            required
            value={form.language}
            onChange={(value) =>
              updateField(
                "language",
                value.toLowerCase(),
              )
            }
            placeholder="en"
          />

          <Field
            label="Timezone"
            required
            value={form.timezone}
            onChange={(value) =>
              updateField(
                "timezone",
                value,
              )
            }
            placeholder="Asia/Kolkata"
          />
        </div>
      </section>

      {/* Contact */}

      <section className="rounded-xl border p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Contact Information
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Contact details displayed to customers.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Primary Email"
            type="email"
            value={form.primaryEmail}
            onChange={(value) =>
              updateField(
                "primaryEmail",
                value,
              )
            }
            placeholder="hello@example.com"
          />

          <Field
            label="Secondary Email"
            type="email"
            value={form.secondaryEmail}
            onChange={(value) =>
              updateField(
                "secondaryEmail",
                value,
              )
            }
            placeholder="support@example.com"
          />

          <Field
            label="Phone"
            value={form.phone}
            onChange={(value) =>
              updateField(
                "phone",
                value,
              )
            }
            placeholder="+919999999999"
          />

          <Field
            label="WhatsApp"
            value={form.whatsapp}
            onChange={(value) =>
              updateField(
                "whatsapp",
                value,
              )
            }
            placeholder="+919999999999"
          />

          <Field
            label="Customer Support Phone"
            value={
              form.customerSupportPhone
            }
            onChange={(value) =>
              updateField(
                "customerSupportPhone",
                value,
              )
            }
            placeholder="+919999999999"
          />
        </div>
      </section>

      {/* Business Address */}

      <section className="rounded-xl border p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Business Address
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Store or business location information.
          </p>
        </div>

        <div className="grid gap-5">
          <Field
            label="Address Line 1"
            value={form.addressLine1}
            onChange={(value) =>
              updateField(
                "addressLine1",
                value,
              )
            }
            placeholder="123 Furniture Street"
          />

          <Field
            label="Address Line 2"
            value={form.addressLine2}
            onChange={(value) =>
              updateField(
                "addressLine2",
                value,
              )
            }
            placeholder="Near City Center"
          />

          <div className="grid gap-5 md:grid-cols-3">
            <Field
              label="City"
              value={form.city}
              onChange={(value) =>
                updateField(
                  "city",
                  value,
                )
              }
              placeholder="Bhubaneswar"
            />

            <Field
              label="State"
              value={form.state}
              onChange={(value) =>
                updateField(
                  "state",
                  value,
                )
              }
              placeholder="Odisha"
            />

            <Field
              label="Postal Code"
              value={form.postalCode}
              onChange={(value) =>
                updateField(
                  "postalCode",
                  value,
                )
              }
              placeholder="751001"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Latitude"
              value={form.latitude}
              onChange={(value) =>
                updateField(
                  "latitude",
                  value,
                )
              }
              placeholder="20.2961000"
            />

            <Field
              label="Longitude"
              value={form.longitude}
              onChange={(value) =>
                updateField(
                  "longitude",
                  value,
                )
              }
              placeholder="85.8245000"
            />
          </div>

          <Field
            label="Google Maps URL"
            value={form.googleMapsUrl}
            onChange={(value) =>
              updateField(
                "googleMapsUrl",
                value,
              )
            }
            placeholder="https://maps.google.com/..."
          />
        </div>
      </section>

      {/* Footer */}

      <section className="rounded-xl border p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Footer
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure the footer information displayed
            throughout the website.
          </p>
        </div>

        <div className="grid gap-5">
          <TextareaField
            label="Footer Description"
            value={
              form.footerDescription
            }
            onChange={(value) =>
              updateField(
                "footerDescription",
                value,
              )
            }
            rows={4}
          />

          <Field
            label="Copyright Text"
            value={form.copyrightText}
            onChange={(value) =>
              updateField(
                "copyrightText",
                value,
              )
            }
            placeholder="© 2026 UrbanNest Furniture. All rights reserved."
          />
        </div>
      </section>

      {/* SEO */}

      <section className="rounded-xl border p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            SEO
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Search engine and social sharing metadata.
          </p>
        </div>

        <div className="grid gap-5">
          <Field
            label="SEO Title"
            value={form.seoTitle}
            onChange={(value) =>
              updateField(
                "seoTitle",
                value,
              )
            }
          />

          <TextareaField
            label="SEO Description"
            value={
              form.seoDescription
            }
            onChange={(value) =>
              updateField(
                "seoDescription",
                value,
              )
            }
            rows={4}
          />

          <TextareaField
            label="SEO Keywords"
            value={form.seoKeywords}
            onChange={(value) =>
              updateField(
                "seoKeywords",
                value,
              )
            }
            rows={3}
            placeholder="furniture, sofa, bed, dining table"
          />
        </div>
      </section>

      {/* Open Graph */}

      <section className="rounded-xl border p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Social Sharing
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure how your store appears when
            shared on social platforms.
          </p>
        </div>

        <div className="grid gap-5">
          <Field
            label="Open Graph Title"
            value={form.ogTitle}
            onChange={(value) =>
              updateField(
                "ogTitle",
                value,
              )
            }
          />

          <TextareaField
            label="Open Graph Description"
            value={
              form.ogDescription
            }
            onChange={(value) =>
              updateField(
                "ogDescription",
                value,
              )
            }
            rows={4}
          />

          <Field
            label="Open Graph Image URL"
            value={form.ogImageUrl}
            onChange={(value) =>
              updateField(
                "ogImageUrl",
                value,
              )
            }
            placeholder="https://..."
          />
        </div>
      </section>

      {/* Form status */}

      {state.message && (
        <div
          className={
            state.status === "error"
              ? "rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              : state.status ===
                  "success"
                ? "rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm"
                : "rounded-lg border px-4 py-3 text-sm text-muted-foreground"
          }
        >
          {state.message}
        </div>
      )}

      {/* Save */}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={
            state.status === "saving"
          }
          className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state.status === "saving"
            ? "Saving..."
            : "Save Store Information"}
        </button>
      </div>
    </form>
  );
}

/* =====================================================
   Reusable fields
===================================================== */

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  maxLength,
}: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium">
        {label}

        {required && (
          <span className="ml-1 text-destructive">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="mt-2 flex h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground focus:ring-1 focus:ring-foreground"
      />
    </div>
  );
}

type TextareaFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: TextareaFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        rows={rows}
        className="mt-2 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground focus:ring-1 focus:ring-foreground"
      />
    </div>
  );
}