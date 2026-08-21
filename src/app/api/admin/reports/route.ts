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
    const reports = await prisma.report.findMany({
      include: { reporter: true, targetUser: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ reports });
  } catch (e) {
    return jsonError((e as Error).message, (e as { status?: number }).status || 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { id, status } = await req.json();
    const report = await prisma.report.update({ where: { id }, data: { status } });
    return NextResponse.json({ report });
  } catch (e) {
    return jsonError((e as Error).message, (e as { status?: number }).status || 500);
  }
}
