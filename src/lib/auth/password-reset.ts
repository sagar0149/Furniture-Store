import crypto from "crypto";

const RESET_TOKEN_DURATION_MINUTES = 30;

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashResetToken(
  token: string,
): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export function getResetTokenExpiration(): Date {
  const expiresAt = new Date();

  expiresAt.setMinutes(
    expiresAt.getMinutes() +
      RESET_TOKEN_DURATION_MINUTES,
  );

  return expiresAt;
}