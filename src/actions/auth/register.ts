"use server";

import { registerUser } from "@/services/auth.service";
import { createSession } from "@/lib/auth/session";

export type RegisterActionState = {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: "CUSTOMER" | "ADMIN";
  };
};

export async function registerAction(
  input: unknown,
): Promise<RegisterActionState> {
  try {
    const user = await registerUser(input);

    await createSession(user.id);

    return {
      success: true,
      message: "Account created successfully.",
      user,
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
      message: "Unable to create your account.",
    };
  }
}