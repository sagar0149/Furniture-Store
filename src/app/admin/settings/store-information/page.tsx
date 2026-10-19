
"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { StoreImageManager } from "@/components/admin/store-image-manager";

type StoreSettings = {
  id: string;
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
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  storeName: string;
  tagline: string;
  description: string;
  logoUrl: string;
  faviconUrl: string;
  country: string;
  currency: string;
  language: string;
  timezone: string;
  primaryEmail: string;
  secondaryEmail: string;
  phone: string;
  whatsapp: string;
  customerSupportPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  googleMapsUrl: string;
  footerDescription: string;
  copyrightText: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
};

const COUNTRIES = [
  { name: "India", currency: "INR" },
  { name: "Nepal", currency: "NPR" },
  { name: "United States", currency: "USD" },
  { name: "United Kingdom", currency: "GBP" },
  { name: "Germany", currency: "EUR" },
  { name: "France", currency: "EUR" },
  { name: "Canada", currency: "CAD" },
  { name: "Australia", currency: "AUD" },
  { name: "New Zealand", currency: "NZD" },
  { name: "Singapore", currency: "SGD" },
  { name: "United Arab Emirates", currency: "AED" },
  { name: "Saudi Arabia", currency: "SAR" },
  { name: "Japan", currency: "JPY" },
  { name: "China", currency: "CNY" },
  { name: "South Korea", currency: "KRW" },
] as const;

const CURRENCIES = [
  { code: "USD", label: "US Dollar ($)" },
  { code: "INR", label: "Indian Rupee (₹)" },
  { code: "NPR", label: "Nepalese Rupee (रु)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "CAD", label: "Canadian Dollar (CA$)" },
  { code: "AUD", label: "Australian Dollar (A$)" },
  { code: "NZD", label: "New Zealand Dollar (NZ$)" },
  { code: "SGD", label: "Singapore Dollar (S$)" },
  { code: "AED", label: "UAE Dirham" },
  { code: "SAR", label: "Saudi Riyal" },
  { code: "JPY", label: "Japanese Yen (¥)" },
  { code: "CNY", label: "Chinese Yuan (CN¥)" },
  { code: "KRW", label: "South Korean Won (₩)" },
] as const;

const emptyForm: FormState = {
  storeName: "",
  tagline: "",
  description: "",
  logoUrl: "",
  faviconUrl: "",
  country: "",
  currency: "USD",
  language: "en",
  timezone: "UTC",
  primaryEmail: "",
  secondaryEmail: "",
  phone: "",
  whatsapp: "",
  customerSupportPhone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  latitude: "",
  longitude: "",
  googleMapsUrl: "",
  footerDescription: "",
  copyrightText: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  ogTitle: "",
  ogDescription: "",
  ogImageUrl: "",
};

function settingsToForm(
  settings: StoreSettings,
): FormState {
  return {
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
    secondaryEmail: settings.secondaryEmail ?? "",
    phone: settings.phone ?? "",
    whatsapp: settings.whatsapp ?? "",
    customerSupportPhone: settings.customerSupportPhone ?? "",
    addressLine1: settings.addressLine1 ?? "",
    addressLine2: settings.addressLine2 ?? "",
    city: settings.city ?? "",
    state: settings.state ?? "",
    postalCode: settings.postalCode ?? "",
    latitude: settings.latitude ?? "",
    longitude: settings.longitude ?? "",
    googleMapsUrl: settings.googleMapsUrl ?? "",
    footerDescription: settings.footerDescription ?? "",
    copyrightText: settings.copyrightText ?? "",
    seoTitle: settings.seoTitle ?? "",
    seoDescription: settings.seoDescription ?? "",
    seoKeywords: settings.seoKeywords ?? "",
    ogTitle: settings.ogTitle ?? "",
    ogDescription: settings.ogDescription ?? "",
    ogImageUrl: settings.ogImageUrl ?? "",
  };
}

function inputValue(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export default function StoreInformationPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/admin/settings/store-information",
          { method: "GET", cache: "no-store" },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ?? "Unable to load store settings.",
          );
        }

        setForm(settingsToForm(data));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load store settings.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function updateField(
    field: keyof FormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess("");
    setError("");
  }

  function handleCountryChange(country: string) {
    updateField("country", country);

    const selectedCountry = COUNTRIES.find(
      (item) => item.name === country,
    );

    if (selectedCountry) {
      updateField("currency", selectedCountry.currency);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.storeName.trim()) {
      setError("Store name is required.");
      return;
    }

    if (!form.currency.trim()) {
      setError("Currency is required.");
      return;
    }

    if (!form.language.trim()) {
      setError("Language is required.");
      return;
    }

    if (!form.timezone.trim()) {
      setError("Timezone is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/admin/settings/store-information",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            storeName: form.storeName.trim(),
            tagline: inputValue(form.tagline),
            description: inputValue(form.description),
            logoUrl: inputValue(form.logoUrl),
            faviconUrl: inputValue(form.faviconUrl),
            country: inputValue(form.country),
            currency: form.currency.trim().toUpperCase(),
            language: form.language.trim().toLowerCase(),
            timezone: form.timezone.trim(),
            primaryEmail: inputValue(form.primaryEmail),
            secondaryEmail: inputValue(form.secondaryEmail),
            phone: inputValue(form.phone),
            whatsapp: inputValue(form.whatsapp),
            customerSupportPhone: inputValue(
              form.customerSupportPhone,
            ),
            addressLine1: inputValue(form.addressLine1),
            addressLine2: inputValue(form.addressLine2),
            city: inputValue(form.city),
            state: inputValue(form.state),
            postalCode: inputValue(form.postalCode),
            latitude: inputValue(form.latitude),
            longitude: inputValue(form.longitude),
            googleMapsUrl: inputValue(form.googleMapsUrl),
            footerDescription: inputValue(
              form.footerDescription,
            ),
            copyrightText: inputValue(form.copyrightText),
            seoTitle: inputValue(form.seoTitle),
            seoDescription: inputValue(form.seoDescription),
            seoKeywords: inputValue(form.seoKeywords),
            ogTitle: inputValue(form.ogTitle),
            ogDescription: inputValue(form.ogDescription),
            ogImageUrl: inputValue(form.ogImageUrl),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ?? "Unable to save store settings.",
        );
      }

      if (data.settings) {
        setForm(settingsToForm(data.settings));
      }

      setSuccess("Store information saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save store settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border p-8">
            <p className="text-sm text-muted-foreground">
              Loading store information...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Link
            href="/admin/settings"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Settings
          </Link>

          <p className="mt-6 text-sm text-muted-foreground">
            Store Configuration
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Store Information
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage your store identity, contact information,
            location, localization, footer, and SEO settings.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Store Identity */}
          <section className="rounded-xl border p-6">
            <SectionHeading
              title="Store Identity"
              description="These details identify your store throughout the website."
            />

            <div className="grid gap-5">
              <Field
                label="Store Name"
                required
                value={form.storeName}
                onChange={(value) => updateField("storeName", value)}
                placeholder="UrbanNest Furniture"
              />

              <Field
                label="Tagline"
                value={form.tagline}
                onChange={(value) => updateField("tagline", value)}
                placeholder="Furniture Designed for Modern Living"
              />

              <TextArea
                label="Store Description"
                value={form.description}
                onChange={(value) => updateField("description", value)}
                placeholder="Describe your furniture store..."
                rows={4}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Logo URL"
                  value={form.logoUrl}
                  onChange={(value) => updateField("logoUrl", value)}
                  placeholder="https://..."
                />

                <Field
                  label="Favicon URL"
                  value={form.faviconUrl}
                  onChange={(value) => updateField("faviconUrl", value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>

          {/* Store Images */}
          <div className="space-y-6">
            <StoreImageManager
              type="logo"
              label="Store Logo"
              description="Upload the logo displayed throughout your store."
              currentUrl={form.logoUrl || null}
              recommendedSize="512 × 512 px or larger"
            />

            <StoreImageManager
              type="favicon"
              label="Favicon"
              description="Upload the small icon used by browsers for your store website."
              currentUrl={form.faviconUrl || null}
              recommendedSize="64 × 64 px or larger"
            />

            <StoreImageManager
              type="ogImage"
              label="Open Graph Image"
              description="Upload the image used when store pages are shared on social media."
              currentUrl={form.ogImageUrl || null}
              recommendedSize="1200 × 630 px"
            />
          </div>

          {/* Localization */}
          <section className="rounded-xl border p-6">
            <SectionHeading
              title="Localization"
              description="Configure the country, currency, language, and timezone used by the store."
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="store-country"
                  className="mb-2 block text-sm font-medium"
                >
                  Country
                </label>

                <select
                  id="store-country"
                  value={form.country}
                  onChange={(event) =>
                    handleCountryChange(event.target.value)
                  }
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((country) => (
                    <option
                      key={country.name}
                      value={country.name}
                    >
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="store-currency"
                  className="mb-2 block text-sm font-medium"
                >
                  Currency <span className="text-destructive">*</span>
                </label>

                <select
                  id="store-currency"
                  required
                  value={form.currency}
                  onChange={(event) =>
                    updateField("currency", event.target.value)
                  }
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
                >
                  {CURRENCIES.map((currency) => (
                    <option
                      key={currency.code}
                      value={currency.code}
                    >
                      {currency.code} — {currency.label}
                    </option>
                  ))}
                </select>

                <p className="mt-1 text-xs text-muted-foreground">
                  Country selects a default currency. You can override it here.
                </p>
              </div>

              <Field
                label="Language"
                required
                value={form.language}
                onChange={(value) => updateField("language", value)}
                placeholder="en"
              />

              <Field
                label="Timezone"
                required
                value={form.timezone}
                onChange={(value) => updateField("timezone", value)}
                placeholder="Asia/Kolkata"
              />
            </div>
          </section>

          {/* Contact Information */}
          <section className="rounded-xl border p-6">
            <SectionHeading
              title="Contact Information"
              description="Contact details customers can use to reach your business."
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Primary Email"
                type="email"
                value={form.primaryEmail}
                onChange={(value) => updateField("primaryEmail", value)}
                placeholder="hello@example.com"
              />

              <Field
                label="Secondary Email"
                type="email"
                value={form.secondaryEmail}
                onChange={(value) => updateField("secondaryEmail", value)}
                placeholder="support@example.com"
              />

              <Field
                label="Phone"
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
                placeholder="+919999999999"
              />

              <Field
                label="WhatsApp"
                value={form.whatsapp}
                onChange={(value) => updateField("whatsapp", value)}
                placeholder="+919999999999"
              />

              <Field
                label="Customer Support Phone"
                value={form.customerSupportPhone}
                onChange={(value) =>
                  updateField("customerSupportPhone", value)
                }
                placeholder="+919999999999"
              />
            </div>
          </section>

          {/* Business Address */}
          <section className="rounded-xl border p-6">
            <SectionHeading
              title="Business Address"
              description="The physical location of your store or business."
            />

            <div className="grid gap-5">
              <Field
                label="Address Line 1"
                value={form.addressLine1}
                onChange={(value) => updateField("addressLine1", value)}
                placeholder="123 Furniture Street"
              />

              <Field
                label="Address Line 2"
                value={form.addressLine2}
                onChange={(value) => updateField("addressLine2", value)}
                placeholder="Near City Center"
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="City"
                  value={form.city}
                  onChange={(value) => updateField("city", value)}
                  placeholder="Bhubaneswar"
                />

                <Field
                  label="State"
                  value={form.state}
                  onChange={(value) => updateField("state", value)}
                  placeholder="Odisha"
                />

                <Field
                  label="Postal Code"
                  value={form.postalCode}
                  onChange={(value) => updateField("postalCode", value)}
                  placeholder="751001"
                />

                <div>
                  <label
                    htmlFor="address-country"
                    className="mb-2 block text-sm font-medium"
                  >
                    Country
                  </label>

                  <select
                    id="address-country"
                    value={form.country}
                    onChange={(event) =>
                      handleCountryChange(event.target.value)
                    }
                    className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((country) => (
                      <option
                        key={country.name}
                        value={country.name}
                      >
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Map Location */}
          <section className="rounded-xl border p-6">
            <SectionHeading
              title="Map Location"
              description="Optional geographic information for your store location."
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Latitude"
                value={form.latitude}
                onChange={(value) => updateField("latitude", value)}
                placeholder="20.2961000"
              />

              <Field
                label="Longitude"
                value={form.longitude}
                onChange={(value) => updateField("longitude", value)}
                placeholder="85.8245000"
              />
            </div>

            <div className="mt-5">
              <Field
                label="Google Maps URL"
                value={form.googleMapsUrl}
                onChange={(value) => updateField("googleMapsUrl", value)}
                placeholder="https://maps.google.com/..."
              />
            </div>
          </section>

          {/* Footer */}
          <section className="rounded-xl border p-6">
            <SectionHeading
              title="Footer"
              description="Configure the footer information displayed to customers."
            />

            <div className="grid gap-5">
              <TextArea
                label="Footer Description"
                value={form.footerDescription}
                onChange={(value) =>
                  updateField("footerDescription", value)
                }
                placeholder="Premium furniture for modern homes..."
                rows={3}
              />

              <Field
                label="Copyright Text"
                value={form.copyrightText}
                onChange={(value) => updateField("copyrightText", value)}
                placeholder="© 2026 UrbanNest Furniture. All rights reserved."
              />
            </div>
          </section>

          {/* SEO */}
          <section className="rounded-xl border p-6">
            <SectionHeading
              title="SEO"
              description="Search engine metadata for your store."
            />

            <div className="grid gap-5">
              <Field
                label="SEO Title"
                value={form.seoTitle}
                onChange={(value) => updateField("seoTitle", value)}
                placeholder="UrbanNest Furniture | Premium Furniture"
              />

              <TextArea
                label="SEO Description"
                value={form.seoDescription}
                onChange={(value) => updateField("seoDescription", value)}
                placeholder="Discover premium furniture..."
                rows={4}
              />

              <TextArea
                label="SEO Keywords"
                value={form.seoKeywords}
                onChange={(value) => updateField("seoKeywords", value)}
                placeholder="furniture, sofa, bed, dining table"
                rows={3}
              />
            </div>
          </section>

          {/* Social Sharing */}
          <section className="rounded-xl border p-6">
            <SectionHeading
              title="Social Sharing"
              description="Information used when your store pages are shared on social media."
            />

            <div className="grid gap-5">
              <Field
                label="Open Graph Title"
                value={form.ogTitle}
                onChange={(value) => updateField("ogTitle", value)}
                placeholder="UrbanNest Furniture"
              />

              <TextArea
                label="Open Graph Description"
                value={form.ogDescription}
                onChange={(value) => updateField("ogDescription", value)}
                placeholder="Premium furniture designed for modern living."
                rows={4}
              />

              <Field
                label="Open Graph Image URL"
                value={form.ogImageUrl}
                onChange={(value) => updateField("ogImageUrl", value)}
                placeholder="https://..."
              />
            </div>
          </section>

          {/* Save */}
          <div className="sticky bottom-0 border-t bg-background py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/admin/settings"
                className="inline-flex h-11 items-center justify-center rounded-md border px-5 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

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
      <label className="mb-2 block text-sm font-medium">
        {label}
        {required && (
          <span className="ml-1 text-destructive">*</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground focus:ring-1 focus:ring-foreground"
      />
    </div>
  );
}

type TextAreaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: TextAreaProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full resize-y rounded-md border bg-background px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground focus:ring-1 focus:ring-foreground"
      />
    </div>
  );
}
