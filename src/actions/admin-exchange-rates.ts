
"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { upsertExchangeRate } from "@/repositories/exchange-rate.repository";

export type ExchangeRateActionState = {
  success: boolean;
  message: string;
};

export async function saveExchangeRateAction(
  _previousState: ExchangeRateActionState,
  formData: FormData,
): Promise<ExchangeRateActionState> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        message: "Please sign in before changing exchange rates.",
      };
    }

    // TODO: Add an explicit admin-role/permission check here
    // using the project's actual authorization model.

    const currency = String(formData.get("currency") ?? "");
    const rate = String(formData.get("rate") ?? "");

    await upsertExchangeRate(currency, rate);

    revalidatePath("/admin/settings/exchange-rates");

    return {
      success: true,
      message: `${currency.trim().toUpperCase()} exchange rate saved.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to save the exchange rate.",
    };
  }
}
