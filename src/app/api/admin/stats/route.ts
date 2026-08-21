import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";

async function admin() {
  const me = await getCurrentUser();
  if (!me || me.role !== "admin") throw Object.assign(new Error("Дастрасӣ манъ аст"), { status: 403 });
  return me;
}

export async function GET() {
  try {
    await admin();
    const [users, masters, orders, reviews, reports] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "master" } }),
      prisma.order.count(),
      prisma.review.count(),
      prisma.report.count({ where: { status: "pending" } }),
    ]);
    return NextResponse.json({ stats: { users, masters, orders, reviews, reports } });
  } catch (e) {
    const status = (e as { status?: number }).status || 500;
    return jsonError((e as Error).message, status);
  }
}

export async function POST(req: NextRequest) {
  try {
    await admin();
    const { resource } = await req.json();
    return NextResponse.json({ ok: true, resource });
  } catch (e) {
    const status = (e as { status?: number }).status || 500;
    return jsonError((e as Error).message, status);
  }
}
