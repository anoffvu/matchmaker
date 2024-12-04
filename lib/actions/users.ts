"use server";

import { NewUserParams, insertUserSchema, users } from "@/lib/db/schema/users";
import { getEmbeddings } from "../ai/embeddings";
import { db } from "../db";

export const createUser = async (input: NewUserParams) => {
  try {
    const { name, bio } = insertUserSchema.parse(input);

    const userString = `NAME: ${name}. BIO: ${bio}`;
    const embedding = await getEmbeddings(userString);

    await db.insert(users).values({ name, bio, embedding });

    return { success: true };
  } catch (error) {
    throw error;
  }
};
