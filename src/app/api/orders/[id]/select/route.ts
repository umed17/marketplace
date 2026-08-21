import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { notify } from "@/lib/notifications";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) return jsonError("Ворид шавед", 401);

  const { offerId } = await req.json();
  const order = await prisma.order.findUnique({ where: { id }, include: { offers: true } });
  if (!order) return jsonError("Заказ ёфт нашуд", 404);
  if (order.customerId !== me.id) return jsonError("Дастрасӣ манъ аст", 403);
  if (!["published", "receiving_offers"].includes(order.status)) {
    return jsonError("Усто аллакай интихоб шудааст", 400);
  }

  const offer = order.offers.find((o) => o.id === offerId);
  if (!offer) return jsonError("Пешниҳод ёфт нашуд", 404);

  await prisma.$transaction([
    prisma.orderOffer.update({ where: { id: offer.id }, data: { status: "accepted" } }),
    prisma.orderOffer.updateMany({
      where: { orderId: id, NOT: { id: offer.id } },
      data: { status: "rejected" },
    }),
    prisma.order.update({
      where: { id },
      data: { selectedMasterId: offer.masterId, status: "master_selected" },
    }),
  ]);

  const conversation = await prisma.conversation.upsert({
    where: { orderId: id },
    update: {},
    create: { orderId: id, customerId: me.id, masterId: offer.masterId },
  });

  await notify({
    userId: offer.masterId,
    type: "offer_accepted",
    title: "Шуморо интихоб карданд",
    body: `${me.firstName} пешниҳоди шуморо барои «${order.title}» қабул кард.`,
    link: `/chat/${conversation.id}`,
  });

  const rejected = order.offers.filter((o) => o.id !== offer.id);
  await Promise.all(
    rejected.map((o) =>
      notify({
        userId: o.masterId,
        type: "offer_rejected",
        title: "Пешниҳод қабул нашуд",
        body: `Муштарӣ устои дигарро барои «${order.title}» интихоб кард.`,
        link: `/orders/${order.id}`,
      }),
    ),
  );

  return NextResponse.json({ ok: true, conversationId: conversation.id });
}
