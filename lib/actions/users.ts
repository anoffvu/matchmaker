"use server";

import { NewUserParams, insertUserSchema, users } from "@/lib/db/schema/users";
import { getEmbeddings } from "../ai/embeddings";
import { db } from "../db";
import { supabaseClient } from "@/lib/db";

export const createUser = async (input: NewUserParams) => {
  try {
    const { name, bio, attributes, matchreason } =
      insertUserSchema.parse(input);

    const embedding = await getEmbeddings(attributes as string);

    const { data: matches } = await supabaseClient.rpc("match_users", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 4,
    });

    await db.insert(users).values({ name, bio, attributes, matchreason, embedding });

    return { name, matchreason, embedding, matches };
  } catch (error) {
    throw error;
  }
};
