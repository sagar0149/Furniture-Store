
"use client";

import Image from "next/image";
import { useState } from "react";

type GalleryImage = {
  id: string;
  url: string;
  altText: string | null;
};

type ProductImageGalleryProps = {
  images: GalleryImage[];
  productName: string;
};

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const activeImage = images[activeIndex];

  if (!activeImage) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-[#f4f1ec] text-sm text-gray-500">
        No product image available
      </div>
    );
  }

  function selectImage(index: number) {
    setActiveIndex(index);
    setZoomed(false);
  }

  return (
    <div className="w-full min-w-0">
      <div
        className="group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-xl border border-gray-200 bg-[#f4f1ec]"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        <Image
          key={activeImage.id}
          src={activeImage.url}
          alt={activeImage.altText ?? productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={`object-contain p-2 transition-transform duration-500 ease-out sm:p-4 ${
            zoomed ? "scale-125" : "scale-100"
          }`}
        />

        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1.5 text-xs text-gray-700 shadow-sm">
          Hover to zoom
        </span>
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => selectImage(index)}
                aria-label={`View image ${index + 1} of ${images.length}`}
                aria-pressed={isActive}
                className={`relative aspect-square min-w-0 overflow-hidden rounded-lg border-2 bg-[#f4f1ec] transition ${
                  isActive
                    ? "border-[#806747] ring-2 ring-[#806747]/20"
                    : "border-gray-200 hover:border-[#806747]/60"
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.altText ?? `${productName} image ${index + 1}`}
                  fill
                  sizes="120px"
                  className="object-contain p-1 transition-transform duration-300 hover:scale-110"
                />
              </button>
            );
          })}
        </div>
      )}

      {images.length > 1 && (
        <p className="mt-3 text-center text-xs text-gray-500">
          Select a thumbnail to view another image
        </p>
      )}
    </div>
  );
}
