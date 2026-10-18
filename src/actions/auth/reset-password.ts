"use server";

import {
  resetUserPassword,
} from "@/services/auth.service";

export type ResetPasswordActionState = {
  success: boolean;
  message: string;
};

export async function resetPasswordAction(
  input: unknown,
): Promise<ResetPasswordActionState> {
  try {
    await resetUserPassword(input);

    return {
      success: true,
      message:
        "Your password has been reset successfully.",
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message:
        "Unable to reset your password.",
    };
  }
}