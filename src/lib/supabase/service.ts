import { createClient } from "@supabase/supabase-js";
import { readSupabaseEnv } from "@/lib/supabase/env";

export function isSupabaseServerConfigured() {
  return Boolean(readSupabaseEnv("NEXT_PUBLIC_SUPABASE_URL") && readSupabaseEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}

export function createAnonClient() {
  const url = readSupabaseEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = readSupabaseEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !key) {
    throw new Error("Supabase is not configured");
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
