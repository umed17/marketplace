/** Strip stray quotes Railway sometimes stores in env values. */
export function readSupabaseEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
  const raw = process.env[name];
  if (!raw) return undefined;
  return raw.replace(/^["']+|["']+$/g, "").trim();
}
