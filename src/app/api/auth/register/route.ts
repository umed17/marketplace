import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { applyAuthCookie, publicUser, signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { handleError, jsonError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { getPostAuthRedirect } from "@/lib/post-auth-redirect";
import { normalizePhone } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    if (!rateLimit(`register:${ip}`, 8, 60_000).ok) {
      return jsonError("Зиёд кӯшиш кардед. Баъдтар такрор кунед.", 429);
    }

    const body = await req.json();
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

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone,
        passwordHash: await hashPassword(data.password),
        role: data.role,
        customerProfile: data.role === "customer" ? { create: {} } : undefined,
        masterProfile: data.role === "master" ? { create: { displayName: `${data.firstName} ${data.lastName}` } } : undefined,
      },
      include: { masterProfile: true },
    });

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const redirect = getPostAuthRedirect(user);
    const res = NextResponse.json({ user: publicUser(user), redirect });
    return applyAuthCookie(res, token);
  } catch (error) {
    return handleError(error);
  }
}
