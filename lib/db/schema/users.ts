import { integer, pgTable, varchar, vector } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod"; // using older version -> https://github.com/drizzle-team/drizzle-orm/issues/2424
import { z } from "zod";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 2048 }).notNull(),
  bio: varchar({ length: 2048 }),
  matchreason: varchar({ length: 2048 }),
  attributes: varchar({ length: 2048 }),
  embedding: vector('embedding', { dimensions: 768 }),
});

export const insertUserSchema = createSelectSchema(users).extend({}).omit({
  id: true,
});

// Type for resources - used to type API request params and within Components
export type NewUserParams = z.infer<typeof insertUserSchema>;