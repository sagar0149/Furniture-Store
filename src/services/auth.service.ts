import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserPassword,
} from "@/repositories/user.repository";

import {
  createPasswordResetToken,
  findValidPasswordResetToken,
  deletePasswordResetToken,
  deleteUserPasswordResetTokens,
} from "@/repositories/password-reset.repository";

import {
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password";

import {
  generateResetToken,
  hashResetToken,
  getResetTokenExpiration,
} from "@/lib/auth/password-reset";

import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

/**
 * Register a new customer.
 *
 * New registrations are always created as CUSTOMER.
 * The client cannot choose the user role.
 */
export async function registerUser(
  input: unknown,
) {
  const validated =
    registerSchema.parse(input);

  const existingUser =
    await findUserByEmail(validated.email);

  if (existingUser) {
    throw new Error(
      "An account with this email already exists.",
    );
  }

  const passwordHash =
    await hashPassword(validated.password);

  const user = await createUser({
    name: validated.name,
    email: validated.email,
    passwordHash,
    phone:
      validated.phone || undefined,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/**
 * Authenticate an existing user.
 */
export async function authenticateUser(
  input: unknown,
) {
  const validated =
    loginSchema.parse(input);

  const user =
    await findUserByEmail(validated.email);

  /*
   * Do not reveal whether an email exists.
   * This prevents account enumeration.
   */
  if (!user || !user.isActive) {
    return null;
  }

  const passwordValid =
    await verifyPassword(
      validated.password,
      user.passwordHash,
    );

  if (!passwordValid) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/**
 * Create a password reset request.
 *
 * Previous reset tokens for the same user
 * are invalidated before creating a new one.
 */
export async function createPasswordResetRequest(
  userId: string,
) {
  // Invalidate previous reset tokens.
  await deleteUserPasswordResetTokens(userId);

  // Generate a cryptographically secure token.
  const token = generateResetToken();

  // Never store the raw token in the database.
  const tokenHash =
    hashResetToken(token);

  // Generate expiration time.
  const expiresAt =
    getResetTokenExpiration();

  await createPasswordResetToken({
    userId,
    tokenHash,
    expiresAt,
  });

  return {
    token,
    expiresAt,
  };
}

/**
 * Reset a user's password using a valid
 * password reset token.
 */
export async function resetUserPassword(
  input: unknown,
) {
  const validated =
    resetPasswordSchema.parse(input);

  /*
   * Hash the token supplied by the user
   * so it can be compared against the
   * hash stored in PostgreSQL.
   */
  const tokenHash =
    hashResetToken(validated.token);

  const resetToken =
    await findValidPasswordResetToken(
      tokenHash,
    );

  if (!resetToken) {
    throw new Error(
      "This password reset link is invalid or has expired.",
    );
  }

  const user =
    await findUserById(
      resetToken.userId,
    );

  if (!user || !user.isActive) {
    throw new Error(
      "This password reset link is invalid or has expired.",
    );
  }

  /*
   * Hash the new password with bcrypt.
   */
  const passwordHash =
    await hashPassword(
      validated.password,
    );

  const updatedUser =
    await updateUserPassword(
      user.id,
      passwordHash,
    );

  if (!updatedUser) {
    throw new Error(
      "Unable to update your password.",
    );
  }

  /*
   * Delete all reset tokens for this user.
   * This prevents the reset link from being
   * reused after a successful password change.
   */
  await deleteUserPasswordResetTokens(
    user.id,
  );

  /*
   * Explicit cleanup of the token that was used.
   * This is safe even if it was already removed.
   */
  await deletePasswordResetToken(
    tokenHash,
  );

  return {
    id: updatedUser.id,
    email: updatedUser.email,
  };
}