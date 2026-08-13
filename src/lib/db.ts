/**
 * src/lib/db.ts
 * Server-side only Supabase client.
 *
 * Uses the SERVICE_ROLE key for all server-side operations (bypasses RLS).
 * NEVER import this module in client components or expose it to the browser.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";

if (process.env.NODE_ENV === "production" && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
  console.warn(
    "[wallking-db] Warning: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment. Database calls will fail until configured."
  );
}

export const db = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export type Database = typeof db;
