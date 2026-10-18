import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

export async function findUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  return result[0] ?? null;
}

export async function findUserById(id: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
}) {
  const normalizedEmail = data.email
    .trim()
    .toLowerCase();

  const result = await db
    .insert(users)
    .values({
      name: data.name.trim(),
      email: normalizedEmail,
      passwordHash: data.passwordHash,
      phone: data.phone?.trim() || null,
      role: "CUSTOMER",
      isActive: true,
    })
    .returning();

  return result[0];
}

export async function updateUserActiveStatus(
  id: string,
  isActive: boolean,
) {
  const result = await db
    .update(users)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  return result[0] ?? null;
}
export async function updateUserPassword(
  id: string,
  passwordHash: string,
) {
  const result = await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      email: users.email,
    });

  return result[0] ?? null;
}