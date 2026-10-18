import { NextResponse } from "next/server";

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

type StoreImageType =
  | "logo"
  | "favicon"
  | "ogImage";

function getCloudinaryFolder(
  type: StoreImageType,
) {
  return `furniture-store/store/${type}`;
}

function getPublicIdField(
  type: StoreImageType,
) {
  switch (type) {
    case "logo":
      return "logoPublicId";

    case "favicon":
      return "faviconPublicId";

    case "ogImage":
      return "ogImagePublicId";
  }
}

function getUrlField(
  type: StoreImageType,
) {
  switch (type) {
    case "logo":
      return "logoUrl";

    case "favicon":
      return "faviconUrl";

    case "ogImage":
      return "ogImageUrl";
  }
}

export async function POST(
  request: Request,
) {
  let uploadedPublicId: string | null =
    null;

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

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    const type =
      formData.get("type");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "Please select an image.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      type !== "logo" &&
      type !== "favicon" &&
      type !== "ogImage"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid store image type.",
        },
        {
          status: 400,
        },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error:
            "Only JPG, PNG, and WebP images are allowed.",
        },
        {
          status: 400,
        },
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        {
          error:
            "The selected image is empty.",
        },
        {
          status: 400,
        },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "Image size must be 10 MB or smaller.",
        },
        {
          status: 400,
        },
      );
    }

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

    const publicIdField =
      getPublicIdField(type);

    const urlField =
      getUrlField(type);

    const previousPublicId =
      settings[publicIdField];

    const updated =
      await updateStoreSettings({
        [urlField]:
          uploadResult.secure_url,

        [publicIdField]:
          uploadResult.public_id,
      });

    if (!updated) {
      throw new Error(
        "Unable to save image information.",
      );
    }

    /*
     * Delete the previous Cloudinary image
     * only after the database has been updated
     * successfully.
     */
    if (
      previousPublicId &&
      previousPublicId !==
        uploadResult.public_id
    ) {
      try {
        await cloudinary.uploader.destroy(
          previousPublicId,
          {
            resource_type: "image",
          },
        );
      } catch (deleteError) {
        console.error(
          "Previous store image deletion failed:",
          deleteError,
        );
      }
    }

    uploadedPublicId = null;

    return NextResponse.json({
      success: true,
      type,
      url: uploadResult.secure_url,
      publicId:
        uploadResult.public_id,
      settings: updated,
    });
  } catch (error) {
    console.error(
      "Store image upload error:",
      error,
    );

    /*
     * If Cloudinary upload succeeded but
     * database saving failed, remove the
     * newly uploaded image to prevent an
     * orphaned Cloudinary asset.
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
          "Cloudinary cleanup failed:",
          cleanupError,
        );
      }
    }

    const message =
      error instanceof Error
        ? error.message
        : "Unable to upload store image.";

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