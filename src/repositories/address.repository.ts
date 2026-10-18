import {
  and,
  asc,
  desc,
  eq,
} from "drizzle-orm";

import { db } from "@/db";

import { addresses } from "@/db/schema";

export async function getAddressesByUserId(
  userId: string,
) {
  return db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(
      desc(addresses.isDefault),
      asc(addresses.createdAt),
    );
}

export async function getAddressById(
  id: string,
) {
  const result = await db
    .select()
    .from(addresses)
    .where(eq(addresses.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function getUserAddressById(
  userId: string,
  addressId: string,
) {
  const result = await db
    .select()
    .from(addresses)
    .where(
      and(
        eq(addresses.id, addressId),
        eq(addresses.userId, userId),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

export async function getDefaultAddress(
  userId: string,
) {
  const result = await db
    .select()
    .from(addresses)
    .where(
      and(
        eq(addresses.userId, userId),
        eq(addresses.isDefault, true),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

export async function createAddress(
  data: {
    userId: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    landmark?: string;
    isDefault?: boolean;
  },
) {
  const result = await db
    .insert(addresses)
    .values({
      userId: data.userId,
      fullName: data.fullName,
      phone: data.phone,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      landmark: data.landmark,
      isDefault: data.isDefault ?? false,
    })
    .returning();

  return result[0] ?? null;
}

export async function updateAddress(
  id: string,
  userId: string,
  data: {
    fullName?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string | null;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    landmark?: string | null;
    isDefault?: boolean;
  },
) {
  const result = await db
    .update(addresses)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(addresses.id, id),
        eq(addresses.userId, userId),
      ),
    )
    .returning();

  return result[0] ?? null;
}

export async function deleteAddress(
  id: string,
  userId: string,
) {
  const result = await db
    .delete(addresses)
    .where(
      and(
        eq(addresses.id, id),
        eq(addresses.userId, userId),
      ),
    )
    .returning({
      id: addresses.id,
    });

  return result[0] ?? null;
}

export async function clearDefaultAddresses(
  userId: string,
) {
  return db
    .update(addresses)
    .set({
      isDefault: false,
      updatedAt: new Date(),
    })
    .where(eq(addresses.userId, userId));
}

export async function setDefaultAddress(
  id: string,
  userId: string,
) {
  const result = await db
    .update(addresses)
    .set({
      isDefault: true,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(addresses.id, id),
        eq(addresses.userId, userId),
      ),
    )
    .returning();

  return result[0] ?? null;
}