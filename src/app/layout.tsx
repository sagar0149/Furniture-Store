
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { connection } from "next/server";

import "./globals.css";

import { getStoreSettings } from "@/repositories/store-settings.repository";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  await connection();

  const settings = await getStoreSettings();

  const storeName =
    settings?.storeName?.trim() || "Furniture Store";

  const description =
    settings?.seoDescription?.trim() ||
    settings?.description?.trim() ||
    settings?.tagline?.trim() ||
    "Discover thoughtfully designed furniture for every room in your home.";

  const title =
    settings?.seoTitle?.trim() || storeName;

  const ogTitle =
    settings?.ogTitle?.trim() || title;

  const ogDescription =
    settings?.ogDescription?.trim() || description;

  const ogImage = settings?.ogImageUrl?.trim();
  const favicon = settings?.faviconUrl?.trim();

  return {
    title,
    description,
    keywords: settings?.seoKeywords?.trim() || undefined,

    icons: favicon
      ? {
          icon: favicon,
          shortcut: favicon,
        }
      : undefined,

    openGraph: {
      title: ogTitle,
      description: ogDescription,
      siteName: storeName,
      type: "website",
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                width: 1200,
                height: 630,
                alt: ogTitle,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
