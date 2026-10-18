"use server";

import { deleteSession } from "@/lib/auth/session";

export async function logoutAction(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await deleteSession();

    return {
      success: true,
      message: "Logged out successfully.",
    };
  } catch (error) {
    console.error("Logout error:", error);

    return {
      success: false,
      message: "Unable to log out.",
    };
  }
}