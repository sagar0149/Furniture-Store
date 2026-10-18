"use server";

import {
  authenticateUser,
} from "@/services/auth.service";

import {
  createSession,
} from "@/lib/auth/session";

export type LoginActionState = {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: "CUSTOMER" | "ADMIN";
  };
};

export async function loginAction(
  input: unknown,
): Promise<LoginActionState> {
  try {
    const user = await authenticateUser(input);

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    await createSession(user.id);

    return {
      success: true,
      message: "Login successful.",
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
      message: "Unable to sign in.",
    };
  }
}