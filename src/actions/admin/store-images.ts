"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { cloudinary } from "@/lib/cloudinary";

import {
  getStoreSettings,
  updateStoreSettings,
} from "@/repositories/store-settings.repository";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type StoreImageType =
  | "logo"
  | "favicon"
  | "ogImage";

export type StoreImageActionState = {
  success: boolean;
  message: string;
  image?: {
    url: string;
    publicId: string;
  };
};

function getImageFields(type: StoreImageType) {
  switch (type) {
    case "logo":
      return {
        urlField: "logoUrl" as const,
        publicIdField: "logoPublicId" as const,
      };

    case "favicon":
      return {
        urlField: "faviconUrl" as const,
        publicIdField: "faviconPublicId" as const,
      };

    case "ogImage":
      return {
        urlField: "ogImageUrl" as const,
        publicIdField: "ogImagePublicId" as const,
      };
  }
}

function getCloudinaryFolder(
  type: StoreImageType,
) {
  switch (type) {
    case "logo":
      return "furniture-store/settings/logo";

    case "favicon":
      return "furniture-store/settings/favicon";

    case "ogImage":
      return "furniture-store/settings/og-image";
  }
}

export async function uploadStoreImageAction(
  type: StoreImageType,
  formData: FormData,
): Promise<StoreImageActionState> {
  let uploadedPublicId: string | null = null;

  try {
    await requireAdmin();

    if (
      type !== "logo" &&
      type !== "favicon" &&
      type !== "ogImage"
    ) {
      return {
        success: false,
        message: "Invalid store image type.",
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

    const settings =
      await getStoreSettings();

    if (!settings) {
      return {
        success: false,
        message:
          "Store settings have not been initialized.",
      };
    }

    const fields =
      getImageFields(type);

    const oldPublicId =
      settings[fields.publicIdField];

    const buffer = Buffer.from(
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
              folder:
                getCloudinaryFolder(type),
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

    uploadedPublicId =
      uploadResult.public_id;

    const updated =
      await updateStoreSettings({
        [fields.urlField]:
          uploadResult.secure_url,
        [fields.publicIdField]:
          uploadResult.public_id,
      });

    if (!updated) {
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

    /*
     * Delete the previous Cloudinary image
     * only after the new image has successfully
     * been saved in the database.
     */
    if (
      oldPublicId &&
      oldPublicId !==
        uploadResult.public_id
    ) {
      try {
        await cloudinary.uploader.destroy(
          oldPublicId,
          {
            resource_type: "image",
          },
        );
      } catch (cleanupError) {
        /*
         * Do not fail the upload because the
         * old Cloudinary asset could not be
         * deleted.
         */
        console.error(
          "Old Cloudinary image deletion failed:",
          cleanupError,
        );
      }
    }

    uploadedPublicId = null;

    return {
      success: true,
      message:
        "Store image uploaded successfully.",
      image: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    };
  } catch (error) {
    console.error(
      "Store image upload error:",
      error,
    );

    /*
     * If something failed after Cloudinary
     * uploaded the file but before the normal
     * success path completed, clean it up.
     */
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(
          uploadedPublicId,
          {
            resource_type: "image",
          },
        );
      } catch (cleanupError) {
        console.error(
          "Failed to clean up uploaded image:",
          cleanupError,
        );
      }
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message:
        "Unable to upload store image.",
    };
  }
}

export async function deleteStoreImageAction(
  type: StoreImageType,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await requireAdmin();

    if (
      type !== "logo" &&
      type !== "favicon" &&
      type !== "ogImage"
    ) {
      return {
        success: false,
        message: "Invalid store image type.",
      };
    }

    const settings =
      await getStoreSettings();

    if (!settings) {
      return {
        success: false,
        message:
          "Store settings have not been initialized.",
      };
    }

    const fields =
      getImageFields(type);

    const publicId =
      settings[fields.publicIdField];

    if (!publicId) {
      /*
       * Clear the URL anyway in case an old
       * record has a URL but no publicId.
       */
      await updateStoreSettings({
        [fields.urlField]: null,
        [fields.publicIdField]: null,
      });

      return {
        success: true,
        message:
          "Store image removed successfully.",
      };
    }

    /*
     * Remove the Cloudinary asset first.
     */
    try {
      await cloudinary.uploader.destroy(
        publicId,
        {
          resource_type: "image",
        },
      );
    } catch (cloudinaryError) {
      console.error(
        "Cloudinary image deletion failed:",
        cloudinaryError,
      );

      return {
        success: false,
        message:
          "Unable to delete the image from Cloudinary.",
      };
    }

    /*
     * Only clear the database references
     * after Cloudinary deletion succeeds.
     */
    await updateStoreSettings({
      [fields.urlField]: null,
      [fields.publicIdField]: null,
    });

    return {
      success: true,
      message:
        "Store image removed successfully.",
    };
  } catch (error) {
    console.error(
      "Delete store image error:",
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
        "Unable to delete store image.",
    };
  }
}