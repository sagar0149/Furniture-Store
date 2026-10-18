import { and, eq, gt } from "drizzle-orm";

import { db } from "@/db";
import { passwordResetTokens } from "@/db/schema";

export async function createPasswordResetToken(data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  const result = await db
    .insert(passwordResetTokens)
    .values({
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
    })
    .returning();

  return result[0] ?? null;
}

export async function findValidPasswordResetToken(
  tokenHash: string,
) {
  const result = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        gt(
          passwordResetTokens.expiresAt,
          new Date(),
        ),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

export async function deletePasswordResetToken(
  tokenHash: string,
) {
  await db
    .delete(passwordResetTokens)
    .where(
      eq(
        passwordResetTokens.tokenHash,
        tokenHash,
      ),
    );
}

export async function deleteUserPasswordResetTokens(
  userId: string,
) {
  await db
    .delete(passwordResetTokens)
    .where(
      eq(
        passwordResetTokens.userId,
        userId,
      ),
    );
}