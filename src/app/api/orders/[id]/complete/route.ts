import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { notify } from "@/lib/notifications";
import { recalcMasterStats } from "@/lib/ratings";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) return jsonError("Ворид шавед", 401);

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return jsonError("Заказ ёфт нашуд", 404);
  if (order.customerId !== me.id) return jsonError("Дастрасӣ манъ аст", 403);
  if (!["master_selected", "in_progress"].includes(order.status)) {
    return jsonError("Заказро ҳоло анҷомшуда қайд кардан мумкин нест", 400);
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: "completed", completedAt: new Date() },
  });

  if (order.selectedMasterId) {
    await recalcMasterStats(order.selectedMasterId);
    await notify({
      userId: order.selectedMasterId,
      type: "order_completed",
      title: "Заказ анҷом ёфт",
      body: `«${order.title}» анҷомшуда қайд шуд.`,
      link: `/orders/${order.id}`,
    });
  }

  return NextResponse.json({ order: updated, reviewOpen: true });
}
