import { integer, pgTable, varchar, vector } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod"; // using older version -> https://github.com/drizzle-team/drizzle-orm/issues/2424
import { z } from "zod";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 2048 }).notNull(),
  bio: varchar({ length: 2048 }),
  lookingFor: varchar({ length: 2048 }),
  embedding: vector('embedding', { dimensions: 1536 }),
});

export const insertUserSchema = createSelectSchema(users).extend({}).omit({
  id: true,
  lookingFor: true,
});

// Type for resources - used to type API request params and within Components
export type NewUserParams = z.infer<typeof insertUserSchema>;