import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { handleError, jsonError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { normalizePhone } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    if (!rateLimit(`register-check:${ip}`, 12, 60_000).ok) {
      return jsonError("Зиёд кӯшиш кардед. Баъдтар такрор кунед.", 429);
    }

    const data = registerSchema.parse(await req.json());
    const phone = normalizePhone(data.phone);

    const emailExists = await prisma.user.findUnique({ where: { email: data.email } });
    if (emailExists) {
      return jsonError("Ин email аллакай истифода шудааст.", 409);
    }

    const phoneExists = await prisma.user.findUnique({ where: { phone } });
    if (phoneExists) {
      return jsonError("Ин рақами телефон аллакай истифода шудааст.", 409);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
