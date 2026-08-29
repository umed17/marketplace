function clean(raw: string | undefined) {
  if (!raw) return undefined;
  return raw.replace(/^["']+|["']+$/g, "").trim();
}

/** Server/runtime: prefers SUPABASE_* then NEXT_PUBLIC_* */
export function getSupabaseUrl() {
  return clean(process.env.SUPABASE_URL) ?? clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKey() {
  return clean(process.env.SUPABASE_ANON_KEY) ?? clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function getSupabasePublicConfig() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

/** Client: read config injected by SupabasePublicConfig in layout */
export function readBrowserSupabaseConfig(): { url: string; anonKey: string } | null {
  if (typeof document === "undefined") return null;
  const el = document.getElementById("usto-supabase-config");
  if (!el?.textContent) return null;
  try {
    const parsed = JSON.parse(el.textContent) as { url?: string; anonKey?: string };
    if (!parsed.url || !parsed.anonKey) return null;
    return { url: parsed.url, anonKey: parsed.anonKey };
  } catch {
    return null;
  }
}

/** @deprecated use getSupabaseUrl/getSupabaseAnonKey */
export function readSupabaseEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
  if (name === "NEXT_PUBLIC_SUPABASE_URL") return getSupabaseUrl();
  return getSupabaseAnonKey();
}
