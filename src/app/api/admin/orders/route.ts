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

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const status = req.nextUrl.searchParams.get("status") || undefined;
    const orders = await prisma.order.findMany({
      where: status ? { status: status as never } : {},
      include: { customer: true, selectedMaster: true, category: true, offers: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ orders });
  } catch (e) {
    return jsonError((e as Error).message, (e as { status?: number }).status || 500);
  }
}
