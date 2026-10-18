import crypto from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/db";
import { sessions, users } from "@/db/schema";

const SESSION_COOKIE_NAME = "furniture_session";

const SESSION_DURATION_DAYS = 30;

function generateSessionId(): string {
  return crypto.randomBytes(32).toString("hex");
}

function getSessionExpiration(): Date {
  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() + SESSION_DURATION_DAYS,
  );

  return expiresAt;
}

/**
 * Create a new authenticated session.
 */
export async function createSession(
  userId: string,
) {
  const sessionId = generateSessionId();
  const expiresAt = getSessionExpiration();

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return {
    sessionId,
    expiresAt,
  };
}

/**
 * Get the currently authenticated user.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();

  const sessionId = cookieStore.get(
    SESSION_COOKIE_NAME,
  )?.value;

  if (!sessionId) {
    return null;
  }

  const result = await db
    .select({
      user: users,
      session: sessions,
    })
    .from(sessions)
    .innerJoin(
      users,
      eq(sessions.userId, users.id),
    )
    .where(
      and(
        eq(sessions.id, sessionId),
        gt(sessions.expiresAt, new Date()),
        eq(users.isActive, true),
      ),
    )
    .limit(1);

  return result[0]?.user ?? null;
}

/**
 * Delete the current session and authentication cookie.
 */
export async function deleteSession() {
  const cookieStore = await cookies();

  const sessionId = cookieStore.get(
    SESSION_COOKIE_NAME,
  )?.value;

  if (sessionId) {
    await db
      .delete(sessions)
      .where(eq(sessions.id, sessionId));
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}