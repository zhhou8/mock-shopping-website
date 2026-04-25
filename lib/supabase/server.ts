import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function supabaseServer(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase URL or anon key missing in env");
  cached = createClient(url, key, {
    auth: { persistSession: false },
    global: { headers: { "X-Client-Info": "ah-mock-server" } }
  });
  return cached;
}
