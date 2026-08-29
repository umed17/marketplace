import { createBrowserClient } from "@supabase/ssr";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured as isServerSupabaseConfigured,
  readBrowserSupabaseConfig,
} from "@/lib/supabase/env";

export function isSupabaseConfigured() {
  if (typeof window !== "undefined") {
    const injected = readBrowserSupabaseConfig();
    if (injected?.url && injected.anonKey) return true;
  }
  return isServerSupabaseConfigured();
}

function resolveSupabaseCredentials() {
  const injected = typeof window !== "undefined" ? readBrowserSupabaseConfig() : null;
  const url = injected?.url ?? getSupabaseUrl();
  const key = injected?.anonKey ?? getSupabaseAnonKey();
  return { url, key };
}

export function createClient() {
  const { url, key } = resolveSupabaseCredentials();
  if (!url || !key) {
    throw new Error("Supabase is not configured");
  }
  return createBrowserClient(url, key);
}
