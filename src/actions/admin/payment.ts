"use server";

import { requireAdmin } from "@/lib/auth/permissions";

import {
  getPaymentProvider,
  setPaymentProviderEnabled,
  setDefaultPaymentProvider,
} from "@/repositories/payment.repository";

import type {
  PaymentProvider,
} from "@/repositories/payment.repository";

export type PaymentActionResult = {
  success: boolean;
  message: string;
  provider?: PaymentProvider;
};

/**
 * Enable or disable a payment provider.
 */
export async function updatePaymentProviderStatusAction(
  provider: PaymentProvider,
  enabled: boolean,
): Promise<PaymentActionResult> {
  try {
    await requireAdmin();

    const existing =
      await getPaymentProvider(provider);

    if (!existing) {
      return {
        success: false,
        message:
          "Payment provider configuration was not found.",
      };
    }

    /*
     * Prevent disabling the current default
     * provider without selecting another one.
     */
    if (
      existing.isDefault &&
      !enabled
    ) {
      return {
        success: false,
        message:
          "The default payment provider cannot be disabled. Select another default provider first.",
      };
    }

    const updated =
      await setPaymentProviderEnabled(
        provider,
        enabled,
      );

    if (!updated) {
      return {
        success: false,
        message:
          "Unable to update payment provider.",
      };
    }

    return {
      success: true,
      message: enabled
        ? `${provider} has been enabled.`
        : `${provider} has been disabled.`,
      provider,
    };
  } catch (error) {
    console.error(
      "Update payment provider status error:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update payment provider.",
    };
  }
}

/**
 * Make a payment provider the default.
 *
 * The repository automatically:
 *
 * 1. Clears the previous default.
 * 2. Enables the selected provider.
 * 3. Makes the selected provider default.
 */
export async function setDefaultPaymentProviderAction(
  provider: PaymentProvider,
): Promise<PaymentActionResult> {
  try {
    await requireAdmin();

    const existing =
      await getPaymentProvider(provider);

    if (!existing) {
      return {
        success: false,
        message:
          "Payment provider configuration was not found.",
      };
    }

    const updated =
      await setDefaultPaymentProvider(
        provider,
      );

    if (!updated) {
      return {
        success: false,
        message:
          "Unable to set the default payment provider.",
      };
    }

    return {
      success: true,
      message:
        `${provider} is now the default payment provider.`,
      provider,
    };
  } catch (error) {
    console.error(
      "Set default payment provider error:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to set default payment provider.",
    };
  }
}