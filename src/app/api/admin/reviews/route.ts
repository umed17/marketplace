import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { recalcMasterStats } from "@/lib/ratings";

async function requireAdmin() {
  const me = await getCurrentUser();
  if (!me || me.role !== "admin") {
    throw Object.assign(new Error("Дастрасӣ манъ аст"), { status: 403 });
  }
}

export async function GET() {
  try {
    await requireAdmin();
    const reviews = await prisma.review.findMany({
      include: { customer: true, master: true, order: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ reviews });
  } catch (e) {
    return jsonError((e as Error).message, (e as { status?: number }).status || 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { id, status } = await req.json();
    const review = await prisma.review.update({ where: { id }, data: { status } });
    await recalcMasterStats(review.masterId);
    return NextResponse.json({ review });
  } catch (e) {
    return jsonError((e as Error).message, (e as { status?: number }).status || 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return jsonError("id лозим аст");
    const review = await prisma.review.delete({ where: { id } });
    await recalcMasterStats(review.masterId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError((e as Error).message, (e as { status?: number }).status || 500);
  }
}
