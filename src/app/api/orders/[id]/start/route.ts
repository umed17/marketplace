import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) return jsonError("Ворид шавед", 401);

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return jsonError("Заказ ёфт нашуд", 404);

  const allowed = me.id === order.customerId || me.id === order.selectedMasterId || me.role === "admin";
  if (!allowed) return jsonError("Дастрасӣ манъ аст", 403);
  if (order.status !== "master_selected") return jsonError("Ҳолати заказ мувофиқ нест", 400);

  const updated = await prisma.order.update({
    where: { id },
    data: { status: "in_progress" },
  });
  return NextResponse.json({ order: updated });
}
