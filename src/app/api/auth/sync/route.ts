import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { applyAuthCookie, jsonError, publicUser, signToken } from "@/lib/auth";
import { handleError } from "@/lib/api";
import { getPostAuthRedirect } from "@/lib/post-auth-redirect";
import { createClient } from "@/lib/supabase/server";
import { normalizePhone } from "@/lib/utils";

type SignupMeta = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: Role;
};

function readMeta(raw: SignupMeta | undefined) {
  const firstName = String(raw?.firstName ?? "").trim();
  const lastName = String(raw?.lastName ?? "").trim();
  const phone = raw?.phone ? normalizePhone(String(raw.phone)) : "";
  const role = raw?.role === "master" ? "master" : "customer";
  return { firstName, lastName, phone, role: role as Role };
}

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user?.email) {
      return jsonError("Сессия ёфт нашуд. Боз ворид шавед.", 401);
    }

    if (!user.email_confirmed_at) {
      return jsonError("Email-ро аввал тасдиқ кунед.", 403);
    }

    const meta = readMeta(user.user_metadata as SignupMeta);
    if (!meta.firstName || !meta.lastName || !meta.phone) {
      return jsonError("Маълумоти сабти ном нопурра аст. Боз сабти ном кунед.", 400);
    }

    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ supabaseId: user.id }, { email: user.email.toLowerCase() }],
      },
      include: { masterProfile: true },
    });

    if (dbUser?.isBlocked) {
      return jsonError("Аккаунти шумо баста шудааст.", 403);
    }

    if (!dbUser) {
      const phoneTaken = await prisma.user.findUnique({ where: { phone: meta.phone } });
      if (phoneTaken) {
        return jsonError("Ин рақами телефон аллакай истифода шудааст.", 409);
      }

      dbUser = await prisma.user.create({
        data: {
          supabaseId: user.id,
          firstName: meta.firstName,
          lastName: meta.lastName,
          email: user.email.toLowerCase(),
          phone: meta.phone,
          role: meta.role,
          customerProfile: meta.role === "customer" ? { create: {} } : undefined,
          masterProfile:
            meta.role === "master"
              ? { create: { displayName: `${meta.firstName} ${meta.lastName}` } }
              : undefined,
        },
        include: { masterProfile: true },
      });
    } else if (!dbUser.supabaseId) {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { supabaseId: user.id },
        include: { masterProfile: true },
      });
    }

    await prisma.user.update({
      where: { id: dbUser.id },
      data: { lastSeenAt: new Date() },
    });

    const token = await signToken({
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
    });

    const redirect = getPostAuthRedirect(dbUser);
    const res = NextResponse.json({ user: publicUser(dbUser), redirect });
    return applyAuthCookie(res, token);
  } catch (error) {
    return handleError(error);
  }
}
