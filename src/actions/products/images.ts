"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { cloudinary } from "@/lib/cloudinary";

import {
  createProductImage,
  getProductById,
  getProductImages,
  clearPrimaryProductImages,
  setPrimaryProductImage,
  deleteProductImage,
} from "@/repositories/product.repository";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type UploadProductImageState = {
  success: boolean;
  message: string;
  image?: {
    id: string;
    url: string;
    publicId: string;
    altText: string | null;
    isPrimary: boolean;
    displayOrder: number;
  };
};

export async function uploadProductImageAction(
  productId: string,
  formData: FormData,
): Promise<UploadProductImageState> {
  try {
    await requireAdmin();

    if (!productId) {
      return {
        success: false,
        message: "Product ID is required.",
      };
    }

    const product =
      await getProductById(productId);

    if (!product) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return {
        success: false,
        message: "Please select an image.",
      };
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return {
        success: false,
        message:
          "Only JPG, PNG, and WebP images are allowed.",
      };
    }

    if (file.size <= 0) {
      return {
        success: false,
        message: "The selected image is empty.",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        message:
          "Image size must be 10 MB or smaller.",
      };
    }

    const existingImages =
      await getProductImages(productId);

    const displayOrder =
      existingImages.length;

    const isPrimary =
      existingImages.length === 0;

    const buffer =
      Buffer.from(
        await file.arrayBuffer(),
      );

    const uploadResult =
      await new Promise<{
        secure_url: string;
        public_id: string;
      }>((resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder: `furniture-store/products/${productId}`,
              resource_type: "image",
              use_filename: true,
              unique_filename: true,
              overwrite: false,
            },
            (error, result) => {
              if (error) {
                reject(error);
                return;
              }

              if (!result) {
                reject(
                  new Error(
                    "Cloudinary did not return an upload result.",
                  ),
                );
                return;
              }

              resolve({
                secure_url:
                  result.secure_url,
                public_id:
                  result.public_id,
              });
            },
          );

        uploadStream.end(buffer);
      });

    const altText =
      formData.get("altText");

    const savedImage =
      await createProductImage({
        productId,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        altText:
          typeof altText === "string" &&
          altText.trim()
            ? altText.trim()
            : product.name,
        isPrimary,
        displayOrder,
      });

    if (!savedImage) {
      try {
        await cloudinary.uploader.destroy(
          uploadResult.public_id,
          {
            resource_type: "image",
          },
        );
      } catch (cleanupError) {
        console.error(
          "Cloudinary cleanup failed:",
          cleanupError,
        );
      }

      return {
        success: false,
        message:
          "Image was uploaded but could not be saved.",
      };
    }

    return {
      success: true,
      message:
        "Product image uploaded successfully.",
      image: {
        id: savedImage.id,
        url: savedImage.url,
        publicId: savedImage.publicId,
        altText: savedImage.altText,
        isPrimary: savedImage.isPrimary,
        displayOrder:
          savedImage.displayOrder,
      },
    };
  } catch (error) {
    console.error(
      "Product image upload error:",
      error,
    );

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message:
        "Unable to upload product image.",
    };
  }
}

export async function setPrimaryProductImageAction(
  productId: string,
  imageId: string,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await requireAdmin();

    if (!productId || !imageId) {
      return {
        success: false,
        message:
          "Product ID and image ID are required.",
      };
    }

    const images =
      await getProductImages(productId);

    const image = images.find(
      (item) => item.id === imageId,
    );

    if (!image) {
      return {
        success: false,
        message: "Product image not found.",
      };
    }

    await clearPrimaryProductImages(
      productId,
    );

    const updated =
      await setPrimaryProductImage(
        productId,
        imageId,
      );

    if (!updated) {
      return {
        success: false,
        message:
          "Unable to set primary image.",
      };
    }

    return {
      success: true,
      message:
        "Primary image updated successfully.",
    };
  } catch (error) {
    console.error(
      "Set primary image error:",
      error,
    );

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message:
        "Unable to set primary image.",
    };
  }
}

export async function deleteProductImageAction(
  productId: string,
  imageId: string,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await requireAdmin();

    if (!productId || !imageId) {
      return {
        success: false,
        message:
          "Product ID and image ID are required.",
      };
    }

    const images =
      await getProductImages(productId);

    const image = images.find(
      (item) => item.id === imageId,
    );

    if (!image) {
      return {
        success: false,
        message: "Product image not found.",
      };
    }

    const wasPrimary = image.isPrimary;

const deleted = await deleteProductImage(imageId);

if (!deleted) {
  return {
    success: false,
    message: "Unable to delete product image.",
  };
}

if (wasPrimary) {
  const remainingImages = await getProductImages(productId);

  if (remainingImages.length > 0) {
    await clearPrimaryProductImages(productId);

    await setPrimaryProductImage(
      productId,
      remainingImages[0].id,
    );
  }
}

    try {
      await cloudinary.uploader.destroy(
        image.publicId,
        {
          resource_type: "image",
        },
      );
    } catch (cloudinaryError) {
      console.error(
        "Cloudinary image deletion failed:",
        cloudinaryError,
      );
    }

    return {
      success: true,
      message:
        "Product image deleted successfully.",
    };
  } catch (error) {
    console.error(
      "Delete product image error:",
      error,
    );

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message:
        "Unable to delete product image.",
    };
  }
}