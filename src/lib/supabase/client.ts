import { createBrowserClient } from "@supabase/ssr";
import { readSupabaseEnv } from "@/lib/supabase/env";

export function isSupabaseConfigured() {
  return Boolean(readSupabaseEnv("NEXT_PUBLIC_SUPABASE_URL") && readSupabaseEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}

export function createClient() {
  const url = readSupabaseEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = readSupabaseEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !key) {
    throw new Error("Supabase is not configured");
  }
  return createBrowserClient(url, key);
}
