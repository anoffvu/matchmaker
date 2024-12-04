import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(process.env.SUPABASE_DB_URL as string, {ssl: false})
export const db = drizzle({ client });
