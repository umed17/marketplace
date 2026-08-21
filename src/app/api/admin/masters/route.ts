import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";

async function requireAdmin() {
  const me = await getCurrentUser();
  if (!me || me.role !== "admin") {
    throw Object.assign(new Error("Дастрасӣ манъ аст"), { status: 403 });
  }
}

export async function GET() {
  try {
    await requireAdmin();
    const masters = await prisma.masterProfile.findMany({
      include: { user: true, category: true, portfolio: true, services: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ masters });
  } catch (e) {
    return jsonError((e as Error).message, (e as { status?: number }).status || 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { id, isVerified, categoryId, isBlocked } = await req.json();
    if (typeof isBlocked === "boolean") {
      const profile = await prisma.masterProfile.findUnique({ where: { id } });
      if (profile) {
        await prisma.user.update({ where: { id: profile.userId }, data: { isBlocked } });
      }
    }
    const master = await prisma.masterProfile.update({
      where: { id },
      data: {
        isVerified: typeof isVerified === "boolean" ? isVerified : undefined,
        categoryId: categoryId || undefined,
      },
    });
    return NextResponse.json({ master });
  } catch (e) {
    return jsonError((e as Error).message, (e as { status?: number }).status || 500);
  }
}
