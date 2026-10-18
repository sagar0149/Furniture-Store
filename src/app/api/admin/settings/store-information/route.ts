import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/permissions";
import {
  getStoreSettings,
  updateStoreSettings,
} from "@/repositories/store-settings.repository";

export async function GET() {
  try {
    await requireAdmin();

    const settings =
      await getStoreSettings();

    if (!settings) {
      return NextResponse.json(
        {
          error:
            "Store settings have not been initialized.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error(
      "GET store settings error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load store settings.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(
  request: Request,
) {
  try {
    await requireAdmin();

    const body = await request.json();

    if (
      !body ||
      typeof body !== "object"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    const settings =
      await updateStoreSettings({
        storeName:
          typeof body.storeName ===
          "string"
            ? body.storeName
            : undefined,

        tagline:
          typeof body.tagline ===
          "string"
            ? body.tagline
            : null,

        description:
          typeof body.description ===
          "string"
            ? body.description
            : null,

        logoUrl:
          typeof body.logoUrl ===
          "string"
            ? body.logoUrl
            : null,

        faviconUrl:
          typeof body.faviconUrl ===
          "string"
            ? body.faviconUrl
            : null,

        country:
          typeof body.country ===
          "string"
            ? body.country
            : null,

        currency:
          typeof body.currency ===
          "string"
            ? body.currency
            : undefined,

        language:
          typeof body.language ===
          "string"
            ? body.language
            : undefined,

        timezone:
          typeof body.timezone ===
          "string"
            ? body.timezone
            : undefined,

        primaryEmail:
          typeof body.primaryEmail ===
          "string"
            ? body.primaryEmail
            : null,

        secondaryEmail:
          typeof body.secondaryEmail ===
          "string"
            ? body.secondaryEmail
            : null,

        phone:
          typeof body.phone ===
          "string"
            ? body.phone
            : null,

        whatsapp:
          typeof body.whatsapp ===
          "string"
            ? body.whatsapp
            : null,

        customerSupportPhone:
          typeof body.customerSupportPhone ===
          "string"
            ? body.customerSupportPhone
            : null,

        addressLine1:
          typeof body.addressLine1 ===
          "string"
            ? body.addressLine1
            : null,

        addressLine2:
          typeof body.addressLine2 ===
          "string"
            ? body.addressLine2
            : null,

        city:
          typeof body.city ===
          "string"
            ? body.city
            : null,

        state:
          typeof body.state ===
          "string"
            ? body.state
            : null,

        postalCode:
          typeof body.postalCode ===
          "string"
            ? body.postalCode
            : null,

        latitude:
          typeof body.latitude ===
          "string"
            ? body.latitude
            : null,

        longitude:
          typeof body.longitude ===
          "string"
            ? body.longitude
            : null,

        googleMapsUrl:
          typeof body.googleMapsUrl ===
          "string"
            ? body.googleMapsUrl
            : null,

        footerDescription:
          typeof body.footerDescription ===
          "string"
            ? body.footerDescription
            : null,

        copyrightText:
          typeof body.copyrightText ===
          "string"
            ? body.copyrightText
            : null,

        seoTitle:
          typeof body.seoTitle ===
          "string"
            ? body.seoTitle
            : null,

        seoDescription:
          typeof body.seoDescription ===
          "string"
            ? body.seoDescription
            : null,

        seoKeywords:
          typeof body.seoKeywords ===
          "string"
            ? body.seoKeywords
            : null,

        ogTitle:
          typeof body.ogTitle ===
          "string"
            ? body.ogTitle
            : null,

        ogDescription:
          typeof body.ogDescription ===
          "string"
            ? body.ogDescription
            : null,

        ogImageUrl:
          typeof body.ogImageUrl ===
          "string"
            ? body.ogImageUrl
            : null,
      });

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error(
      "PUT store settings error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to update store settings.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      },
    );
  }
}