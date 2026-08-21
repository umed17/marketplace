import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";
import { handleError, jsonError } from "@/lib/api";
import { recalcMasterStats } from "@/lib/ratings";
import { notify } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me) return jsonError("Ворид шавед", 401);
    const data = reviewSchema.parse(await req.json());

    const order = await prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order) return jsonError("Заказ ёфт нашуд", 404);
    if (order.customerId !== me.id) return jsonError("Дастрасӣ манъ аст", 403);
    if (order.status !== "completed") return jsonError("Аввал заказро анҷомшуда қайд кунед", 400);
    if (!order.selectedMasterId) return jsonError("Усто интихоб нашудааст", 400);

    const existing = await prisma.review.findUnique({ where: { orderId: order.id } });
    if (existing) return jsonError("Барои ин заказ аллакай отзыв гузошта шудааст", 409);

    const review = await prisma.review.create({
      data: {
        orderId: order.id,
        customerId: me.id,
        masterId: order.selectedMasterId,
        rating: data.rating,
        comment: data.comment,
      },
    });

    await recalcMasterStats(order.selectedMasterId);
    await notify({
      userId: order.selectedMasterId,
      type: "new_review",
      title: "Отзыви нав",
      body: `${me.firstName} ба шумо ${data.rating} ситора дод.`,
      link: `/masters/${order.selectedMasterId}`,
    });

    return NextResponse.json({ review });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(req: NextRequest) {
  const masterId = req.nextUrl.searchParams.get("masterId");
  if (!masterId) return jsonError("masterId лозим аст");
  const reviews = await prisma.review.findMany({
    where: { masterId, status: "approved" },
    include: { customer: true, order: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reviews });
}
