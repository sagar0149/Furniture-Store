"use server";

import { requireUser } from "@/lib/auth/permissions";

import {
  clearDefaultAddresses,
  createAddress,
  deleteAddress,
  getAddressesByUserId,
  updateAddress,
  setDefaultAddress,
} from "@/repositories/address.repository";

export type AddressInput = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark: string;
  isDefault: boolean;
};

export type AddressResult = {
  success: boolean;
  message: string;
  addressId?: string;
};

/*
 * Explicitly define the validation result as
 * a discriminated union.
 *
 * This allows TypeScript to understand that
 * validation.data exists when success === true.
 */
type ValidationResult =
  | {
      success: true;
      data: {
        fullName: string;
        phone: string;
        addressLine1: string;
        addressLine2: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        landmark: string;
      };
    }
  | {
      success: false;
      message: string;
    };

/**
 * Validate and normalize address data.
 */
function validateAddress(
  data: AddressInput,
): ValidationResult {
  const fullName =
    data.fullName.trim();

  const phone =
    data.phone.trim();

  const addressLine1 =
    data.addressLine1.trim();

  const addressLine2 =
    data.addressLine2.trim();

  const city =
    data.city.trim();

  const state =
    data.state.trim();

  const postalCode =
    data.postalCode.trim();

  const country =
    data.country.trim();

  const landmark =
    data.landmark.trim();

  if (!fullName) {
    return {
      success: false,
      message:
        "Full name is required.",
    };
  }

  if (!phone) {
    return {
      success: false,
      message:
        "Phone number is required.",
    };
  }

  if (!addressLine1) {
    return {
      success: false,
      message:
        "Address line 1 is required.",
    };
  }

  if (!city) {
    return {
      success: false,
      message:
        "City is required.",
    };
  }

  if (!state) {
    return {
      success: false,
      message:
        "State is required.",
    };
  }

  if (!postalCode) {
    return {
      success: false,
      message:
        "Postal code is required.",
    };
  }

  if (!country) {
    return {
      success: false,
      message:
        "Country is required.",
    };
  }

  return {
    success: true,

    data: {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      landmark,
    },
  };
}

/**
 * Create a new address.
 *
 * Existing addresses are preserved.
 */
export async function createAddressAction(
  data: AddressInput,
): Promise<AddressResult> {
  try {
    const user =
      await requireUser();

    const validation =
      validateAddress(data);

    if (!validation.success) {
      return {
        success: false,
        message:
          validation.message,
      };
    }

    const existingAddresses =
      await getAddressesByUserId(
        user.id,
      );

    /*
     * The first address automatically
     * becomes the default address.
     *
     * If the user explicitly selected
     * "Make this my default address",
     * this new address also becomes default.
     */
    const shouldBeDefault =
      existingAddresses.length === 0 ||
      data.isDefault;

    /*
     * If this address becomes default,
     * remove the default flag from all
     * previous addresses.
     *
     * The previous addresses are NOT deleted.
     */
    if (shouldBeDefault) {
      await clearDefaultAddresses(
        user.id,
      );
    }

    /*
     * Create a new address.
     */
    const address =
      await createAddress({
        userId: user.id,

        fullName:
          validation.data.fullName,

        phone:
          validation.data.phone,

        addressLine1:
          validation.data.addressLine1,

        addressLine2:
          validation.data.addressLine2 ||
          undefined,

        city:
          validation.data.city,

        state:
          validation.data.state,

        postalCode:
          validation.data.postalCode,

        country:
          validation.data.country,

        landmark:
          validation.data.landmark ||
          undefined,

        isDefault:
          shouldBeDefault,
      });

    if (!address) {
      return {
        success: false,
        message:
          "Unable to save your address.",
      };
    }

    return {
      success: true,
      message:
        "Address added successfully.",
      addressId: address.id,
    };
  } catch (error) {
    console.error(
      "Create address error:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to save your address.",
    };
  }
}

/**
 * Update an existing address.
 */
export async function updateAddressAction(
  addressId: string,
  data: AddressInput,
): Promise<AddressResult> {
  try {
    const user =
      await requireUser();

    if (!addressId) {
      return {
        success: false,
        message:
          "Address ID is required.",
      };
    }

    const validation =
      validateAddress(data);

    if (!validation.success) {
      return {
        success: false,
        message:
          validation.message,
      };
    }

    /*
     * If the edited address should become
     * default, clear all existing defaults.
     */
    if (data.isDefault) {
      await clearDefaultAddresses(
        user.id,
      );
    }

    const address =
      await updateAddress(
        addressId,
        user.id,
        {
          fullName:
            validation.data.fullName,

          phone:
            validation.data.phone,

          addressLine1:
            validation.data.addressLine1,

          addressLine2:
            validation.data.addressLine2 ||
            null,

          city:
            validation.data.city,

          state:
            validation.data.state,

          postalCode:
            validation.data.postalCode,

          country:
            validation.data.country,

          landmark:
            validation.data.landmark ||
            null,

          isDefault:
            data.isDefault,
        },
      );

    if (!address) {
      return {
        success: false,
        message:
          "Address not found.",
      };
    }

    return {
      success: true,
      message:
        "Address updated successfully.",
      addressId: address.id,
    };
  } catch (error) {
    console.error(
      "Update address error:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update address.",
    };
  }
}

/**
 * Delete an existing address.
 *
 * If the deleted address was the default,
 * another existing address automatically
 * becomes the default.
 */
export async function deleteAddressAction(
  addressId: string,
): Promise<AddressResult> {
  try {
    const user =
      await requireUser();

    if (!addressId) {
      return {
        success: false,
        message:
          "Address ID is required.",
      };
    }

    const addresses =
      await getAddressesByUserId(
        user.id,
      );

    const address =
      addresses.find(
        (item) =>
          item.id === addressId,
      );

    if (!address) {
      return {
        success: false,
        message:
          "Address not found.",
      };
    }

    const deleted =
      await deleteAddress(
        addressId,
        user.id,
      );

    if (!deleted) {
      return {
        success: false,
        message:
          "Unable to delete address.",
      };
    }

    /*
     * If the deleted address was the
     * default address, select another one.
     */
    if (address.isDefault) {
      const remainingAddresses =
        addresses.filter(
          (item) =>
            item.id !== addressId,
        );

      const nextAddress =
        remainingAddresses[0];

      if (nextAddress) {
        await setDefaultAddress(
          nextAddress.id,
          user.id,
        );
      }
    }

    return {
      success: true,
      message:
        "Address deleted successfully.",
    };
  } catch (error) {
    console.error(
      "Delete address error:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to delete address.",
    };
  }
}

/**
 * Make an existing address the default.
 */
export async function setDefaultAddressAction(
  addressId: string,
): Promise<AddressResult> {
  try {
    const user =
      await requireUser();

    if (!addressId) {
      return {
        success: false,
        message:
          "Address ID is required.",
      };
    }

    /*
     * Remove the default flag from
     * every address owned by this user.
     */
    await clearDefaultAddresses(
      user.id,
    );

    /*
     * Set the selected address as default.
     *
     * The repository also verifies
     * ownership using userId.
     */
    const address =
      await setDefaultAddress(
        addressId,
        user.id,
      );

    if (!address) {
      return {
        success: false,
        message:
          "Address not found.",
      };
    }

    return {
      success: true,
      message:
        "Default address updated successfully.",
      addressId: address.id,
    };
  } catch (error) {
    console.error(
      "Set default address error:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update default address.",
    };
  }
}