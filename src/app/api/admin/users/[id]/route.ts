import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

async function requireAdmin() {
  const me = await getCurrentUser();
  if (!me || me.role !== "admin") {
    throw Object.assign(new Error("Дастрасӣ манъ аст"), { status: 403 });
  }
  return me;
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const user = await prisma.user.update({
      where: { id },
      data: {
        isBlocked: body.isBlocked ?? undefined,
        isVerified: body.isVerified ?? undefined,
        role: body.role ?? undefined,
      },
    });
    const { passwordHash, ...safe } = user;
    return NextResponse.json({ user: safe });
  } catch (e) {
    return jsonError((e as Error).message, (e as { status?: number }).status || 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const me = await requireAdmin();
    const { id } = await params;
    if (id === me.id) return jsonError("Шумо худро нест карда наметавонед");
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError((e as Error).message, (e as { status?: number }).status || 500);
  }
}
