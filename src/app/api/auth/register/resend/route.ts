import { NextRequest } from "next/server";
import { z } from "zod";
import { handleError, jsonError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { mapSupabaseAuthError } from "@/lib/supabase/auth-errors";
import { createAnonClient, isSupabaseServerConfigured } from "@/lib/supabase/service";
import type { Locale } from "@/lib/i18n";

const bodySchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  locale: z.enum(["tg", "ru"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    if (!rateLimit(`register-resend:${ip}`, 6, 60_000).ok) {
      return jsonError("Зиёд кӯшиш кардед. Баъдтар такрор кунед.", 429);
    }

    if (!isSupabaseServerConfigured()) {
      return jsonError("Тасдиқи email танзим нашудааст. Бо дастгирӣ тамос гиред.", 503);
    }

    const body = bodySchema.parse(await req.json());
    const locale: Locale = body.locale === "ru" ? "ru" : "tg";

    const supabase = createAnonClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: body.email,
    });

    if (error) {
      console.error("[register/resend] Supabase error:", error.code, error.message);
      return jsonError(mapSupabaseAuthError(error, locale), error.status || 400);
    }

    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
