import { getSupabasePublicConfig } from "@/lib/supabase/env";

export function SupabasePublicConfig() {
  const config = getSupabasePublicConfig();
  if (!config) return null;

  return (
    <script
      id="usto-supabase-config"
      type="application/json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(config) }}
    />
  );
}
