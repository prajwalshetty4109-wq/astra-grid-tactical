import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let cachedClient: SupabaseClient | null = null;

/**
 * Returns a cached Supabase client if valid credentials exist,
 * or null to allow the application to gracefully fall back to the in-memory store.
 *
 * @returns SupabaseClient | null
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (cachedClient) return cachedClient;

  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl.includes("your-project") ||
    supabaseKey.includes("your-anon-key")
  ) {
    return null;
  }

  try {
    cachedClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
    return cachedClient;
  } catch {
    // Graceful fallback to in-memory store
    return null;
  }
};
