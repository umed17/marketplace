import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return jsonError("Ворид шавед", 401);

  if (me.role === "master") {
    const [newOrders, myOffers, inProgress, completed] = await Promise.all([
      prisma.order.count({
        where: {
          status: { in: ["published", "receiving_offers"] },
          ...(me.masterProfile?.categoryId ? { categoryId: me.masterProfile.categoryId } : {}),
        },
      }),
      prisma.orderOffer.count({ where: { masterId: me.id } }),
      prisma.order.count({ where: { selectedMasterId: me.id, status: "in_progress" } }),
      prisma.order.count({ where: { selectedMasterId: me.id, status: "completed" } }),
    ]);
    return NextResponse.json({
      stats: {
        newOrders,
        myOffers,
        inProgress,
        completed,
        rating: me.masterProfile?.ratingAverage ?? 0,
      },
    });
  }

  const [myOrders, offers, inProgress, completed] = await Promise.all([
    prisma.order.count({ where: { customerId: me.id } }),
    prisma.orderOffer.count({ where: { order: { customerId: me.id }, status: "pending" } }),
    prisma.order.count({ where: { customerId: me.id, status: { in: ["master_selected", "in_progress"] } } }),
    prisma.order.count({ where: { customerId: me.id, status: "completed" } }),
  ]);

  return NextResponse.json({
    stats: { myOrders, offers, inProgress, completed },
  });
}
