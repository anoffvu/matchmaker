import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { createClient } from '@supabase/supabase-js'

const client = postgres(process.env.SUPABASE_DB_URL as string, {ssl: false})

export const supabaseClient = createClient(process.env.SUPABASE_API_URL as string, process.env.SUPABASE_ANON_KEY as string);
export const db = drizzle({ client });
