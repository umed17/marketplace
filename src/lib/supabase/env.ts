function clean(raw: string | undefined) {
  if (!raw) return undefined;
  return raw.replace(/^["']+|["']+$/g, "").replace(/\s+/g, "").trim();
}

function decodeJwtPayload(key: string): Record<string, unknown> | null {
  if (!key.startsWith("eyJ")) return null;
  try {
    const part = key.split(".")[1];
    if (!part) return null;
    const pad = "=".repeat((4 - (part.length % 4)) % 4);
    const json = Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getProjectRef(url: string | undefined) {
  if (!url) return undefined;
  return url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
}

/** Legacy JWT anon key or new sb_publishable_* key */
export function validateSupabaseAnonKey(key: string, url?: string) {
  if (key.startsWith("sb_publishable_")) return { ok: true as const };
  const payload = decodeJwtPayload(key);
  if (!payload) return { ok: false as const, reason: "format" as const };
  if (payload.role !== "anon") return { ok: false as const, reason: "not_anon" as const };
  const ref = getProjectRef(url);
  if (ref && payload.ref !== ref) return { ok: false as const, reason: "ref_mismatch" as const };
  return { ok: true as const };
}

function pickSupabaseUrl() {
  const candidates = [clean(process.env.SUPABASE_URL), clean(process.env.NEXT_PUBLIC_SUPABASE_URL)].filter(
    Boolean,
  ) as string[];
  return candidates[0];
}

function pickSupabaseAnonKey(url?: string) {
  const candidates = [
    clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    clean(process.env.SUPABASE_ANON_KEY),
  ].filter(Boolean) as string[];

  for (const key of candidates) {
    if (validateSupabaseAnonKey(key, url).ok) return key;
  }
  return candidates[0];
}

/** Server/runtime: prefers valid key among SUPABASE_* and NEXT_PUBLIC_* */
export function getSupabaseUrl() {
  return pickSupabaseUrl();
}

export function getSupabaseAnonKey() {
  return pickSupabaseAnonKey(getSupabaseUrl());
}

export function isSupabaseConfigured() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return false;
  return validateSupabaseAnonKey(key, url).ok;
}

export function getSupabasePublicConfig() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey || !validateSupabaseAnonKey(anonKey, url).ok) return null;
  return { url, anonKey };
}

export function getSupabaseConfigError(locale: "tg" | "ru" = "tg"): string | null {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    return locale === "ru"
      ? "Подтверждение email не настроено. Добавьте SUPABASE_URL и SUPABASE_ANON_KEY в Railway."
      : "Тасдиқи email танзим нашудааст. SUPABASE_URL ва SUPABASE_ANON_KEY-ро дар Railway илова кунед.";
  }
  const check = validateSupabaseAnonKey(key, url);
  if (check.ok) return null;
  if (check.reason === "not_anon") {
    return locale === "ru"
      ? "Неверный ключ Supabase. Скопируйте anon public (не service_role) в Settings → API → Legacy."
      : "API key-и Supabase нодуруст. Дар Settings → API → Legacy → anon public (на service_role!) нусха баред.";
  }
  if (check.reason === "ref_mismatch") {
    return locale === "ru"
      ? "API key не подходит к URL проекта. Проверьте SUPABASE_URL и anon key одного проекта."
      : "API key ба URL-и лоиҳа мувофиқат намекунад. SUPABASE_URL ва anon key-ро аз як лоиҳа гиред.";
  }
  return locale === "ru"
    ? "Неверный формат API key Supabase. Скопируйте anon public key из Dashboard."
    : "Формати API key-и Supabase нодуруст. Anon public key-ро аз Dashboard нусха баред.";
}

/** Client: read config injected by SupabasePublicConfig in layout */
export function readBrowserSupabaseConfig(): { url: string; anonKey: string } | null {
  if (typeof document === "undefined") return null;
  const el = document.getElementById("usto-supabase-config");
  if (!el?.textContent) return null;
  try {
    const parsed = JSON.parse(el.textContent) as { url?: string; anonKey?: string };
    if (!parsed.url || !parsed.anonKey) return null;
    if (!validateSupabaseAnonKey(parsed.anonKey, parsed.url).ok) return null;
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
