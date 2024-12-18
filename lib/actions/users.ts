"use server";

import { NewUserParams, insertUserSchema, users } from "@/lib/db/schema/users";
import { getEmbeddings } from "../ai/embeddings";
import { db } from "../db";
import { supabaseClient } from "@/lib/db";

export const createUser = async (input: NewUserParams) => {
  try {
    const { name, bio, attributes, matchreason } =
      insertUserSchema.parse(input);
    const userString = attributes ?? bio;

    const embedding = await getEmbeddings(userString as string);

    const { data: matches } = await supabaseClient.rpc("match_users", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 4,
    });

    await db
      .insert(users)
      .values({ name, bio, attributes, matchreason, embedding });

    return { name, matchreason, embedding, matches };
  } catch (error) {
    throw error;
  }
};

export async function processProfileAndFindMatches({
  name,
  bio,
  matchreason,
  attributes,
}: {
  name: string;
  bio: string;
  matchreason?: string;
  attributes?: string;
}) {
  const user = await createUser({
    name,
    bio,
    matchreason: matchreason ?? null,
    attributes: attributes ?? null,
  });
  return {
    message: "User bio saved successfully",
    success: true,
    matches: user.matches,
    matchreason: user.matchreason,
  };
}
