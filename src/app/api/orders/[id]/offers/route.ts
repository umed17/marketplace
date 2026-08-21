import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { offerSchema } from "@/lib/validations";
import { handleError, jsonError } from "@/lib/api";
import { notify } from "@/lib/notifications";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) return jsonError("Ворид шавед", 401);

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return jsonError("Заказ ёфт нашуд", 404);
  if (order.customerId !== me.id && me.role !== "admin" && me.role !== "master") {
    return jsonError("Дастрасӣ манъ аст", 403);
  }

  const offers = await prisma.orderOffer.findMany({
    where: { orderId: id },
    include: { master: { include: { masterProfile: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ offers });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const me = await getCurrentUser();
    if (!me) return jsonError("Ворид шавед", 401);
    if (me.role !== "master") return jsonError("Танҳо усто пешниҳод фиристода метавонад", 403);

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return jsonError("Заказ ёфт нашуд", 404);
    if (!["published", "receiving_offers"].includes(order.status)) {
      return jsonError("Ба ин заказ дигар пешниҳод қабул намешавад", 400);
    }

    const data = offerSchema.parse(await req.json());

    const offer = await prisma.orderOffer.upsert({
      where: { orderId_masterId: { orderId: id, masterId: me.id } },
      update: {
        price: data.price,
        message: data.message,
        arrivalTime: data.arrivalTime,
        finishTime: data.finishTime,
        status: "pending",
      },
      create: {
        orderId: id,
        masterId: me.id,
        price: data.price,
        message: data.message,
        arrivalTime: data.arrivalTime,
        finishTime: data.finishTime,
      },
    });

    if (order.status === "published") {
      await prisma.order.update({ where: { id }, data: { status: "receiving_offers" } });
    }

    await notify({
      userId: order.customerId,
      type: "new_offer",
      title: "Пешниҳоди нав",
      body: `${me.firstName} ба «${order.title}» пешниҳод фиристод (${data.price} сомонӣ).`,
      link: `/orders/${order.id}`,
    });

    return NextResponse.json({ offer });
  } catch (error) {
    return handleError(error);
  }
}
