"use server";

import { findUserByEmail } from "@/repositories/user.repository";
import {
  createPasswordResetRequest,
} from "@/services/auth.service";

import {
  loginSchema,
} from "@/lib/validations/auth";

export type ForgotPasswordActionState = {
  success: boolean;
  message: string;
};

export async function forgotPasswordAction(
  input: unknown,
): Promise<ForgotPasswordActionState> {
  try {
    const validated = loginSchema
      .pick({
        email: true,
      })
      .parse(input);

    const user = await findUserByEmail(
      validated.email,
    );

    /*
     * Always return the same response whether
     * the email exists or not.
     *
     * This prevents account enumeration.
     */
    if (!user || !user.isActive) {
      return {
        success: true,
        message:
          "If an account exists with that email, a password reset link will be sent.",
      };
    }

    const { token, expiresAt } =
      await createPasswordResetRequest(user.id);

    /*
     * Email delivery will be implemented later.
     *
     * For development, log only the reset URL.
     * NEVER do this in production.
     */
    if (process.env.NODE_ENV !== "production") {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ??
        "http://localhost:3000";

      const resetUrl =
        `${baseUrl}/reset-password?token=${token}`;

      console.log(
        "DEV PASSWORD RESET URL:",
        resetUrl,
      );

      console.log(
        "RESET TOKEN EXPIRES:",
        expiresAt.toISOString(),
      );
    }

    return {
      success: true,
      message:
        "If an account exists with that email, a password reset link will be sent.",
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
        "Unable to process the password reset request.",
    };
  }
}