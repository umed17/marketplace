import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { applyAuthCookie, publicUser, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { handleError, jsonError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { getPostAuthRedirect } from "@/lib/post-auth-redirect";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    if (!rateLimit(`login:${ip}`, 12, 60_000).ok) {
      return jsonError("Зиёд кӯшиш кардед. Баъдтар такрор кунед.", 429);
    }

    const data = loginSchema.parse(await req.json());
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { masterProfile: true },
    });
    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      return jsonError("Email ё парол нодуруст аст.", 401);
    }
    if (user.isBlocked) {
      return jsonError("Аккаунти шумо баста шудааст.", 403);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
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
