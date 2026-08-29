import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { handleError, jsonError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { mapSupabaseAuthError } from "@/lib/supabase/auth-errors";
import { createAnonClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { normalizePhone } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    if (!rateLimit(`register-signup:${ip}`, 8, 60_000).ok) {
      return jsonError("Зиёд кӯшиш кардед. Баъдтар такрор кунед.", 429);
    }

    if (!isSupabaseConfigured()) {
      return jsonError("Тасдиқи email танзим нашудааст. Бо дастгирӣ тамос гиред.", 503);
    }

    const body = await req.json();
    const locale: Locale = body.locale === "ru" ? "ru" : "tg";
    const data = registerSchema.parse(body);

    const phone = normalizePhone(data.phone);
    const emailExists = await prisma.user.findUnique({ where: { email: data.email } });
    if (emailExists) {
      return jsonError("Ин email аллакай истифода шудааст.", 409);
    }

    const phoneExists = await prisma.user.findUnique({ where: { phone } });
    if (phoneExists) {
      return jsonError("Ин рақами телефон аллакай истифода шудааст.", 409);
    }

    const supabase = createAnonClient();
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone,
          role: data.role,
        },
      },
    });

    if (error) {
      console.error("[register/signup] Supabase error:", error.code, error.message);
      const msg = error.message.toLowerCase();
      if (
        error.code === "user_already_registered" ||
        error.code === "user_already_exists" ||
        msg.includes("already registered")
      ) {
        return NextResponse.json({ ok: true, alreadyRegistered: true });
      }
      return jsonError(mapSupabaseAuthError(error, locale), error.status || 400);
    }

    const alreadyRegistered = signUpData.user?.identities?.length === 0;
    return NextResponse.json({ ok: true, alreadyRegistered });
  } catch (error) {
    return handleError(error);
  }
}
