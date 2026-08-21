import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { orderSchema } from "@/lib/validations";
import { handleError, jsonError } from "@/lib/api";
import { notify } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const me = await getCurrentUser();
  const { searchParams } = req.nextUrl;
  const scope = searchParams.get("scope") || "public";
  const q = searchParams.get("q")?.trim() || "";
  const categoryId = searchParams.get("categoryId") || undefined;
  const city = searchParams.get("city") || undefined;
  const status = searchParams.get("status") || undefined;

  if (scope === "mine") {
    if (!me) return jsonError("Ворид шавед", 401);
    const orders = await prisma.order.findMany({
      where: { customerId: me.id, ...(status ? { status: status as never } : {}) },
      include: { category: true, offers: true, selectedMaster: true, review: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  }

  if (scope === "master") {
    if (!me) return jsonError("Ворид шавед", 401);
    if (me.role !== "master" && me.role !== "admin") return jsonError("Дастрасӣ манъ аст", 403);

    const profile = await prisma.masterProfile.findUnique({ where: { userId: me.id } });
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ["published", "receiving_offers"] },
        ...(profile?.categoryId ? { categoryId: profile.categoryId } : {}),
        ...(city ? { city } : {}),
        ...(q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }] } : {}),
      },
      include: { category: true, customer: true, offers: true },
      orderBy: { createdAt: "desc" },
      take: 80,
    });
    return NextResponse.json({ orders });
  }

  if (scope === "assigned") {
    if (!me) return jsonError("Ворид шавед", 401);
    const orders = await prisma.order.findMany({
      where: { selectedMasterId: me.id },
      include: { category: true, customer: true, offers: true, conversation: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  }

  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["published", "receiving_offers"] },
      ...(categoryId ? { categoryId } : {}),
      ...(city ? { city } : {}),
      ...(q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }] } : {}),
    },
    include: { category: true, customer: { select: { firstName: true, lastName: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me) return jsonError("Ворид шавед", 401);
    if (me.role !== "customer" && me.role !== "admin") {
      return jsonError("Танҳо муштарӣ заказ гузошта метавонад", 403);
    }

    const data = orderSchema.parse(await req.json());
    const directMaster = data.masterId
      ? await prisma.user.findFirst({ where: { id: data.masterId, role: "master", isBlocked: false } })
      : null;

    const order = await prisma.order.create({
      data: {
        customerId: me.id,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        city: data.city,
        district: data.district,
        address: data.address,
        budgetFrom: data.budgetFrom,
        budgetTo: data.budgetTo,
        preferredTime: data.preferredTime,
        priority: data.priority,
        selectedMasterId: directMaster?.id,
        status: directMaster ? "master_selected" : "receiving_offers",
      },
    });

    if (directMaster) {
      const conversation = await prisma.conversation.create({
        data: { orderId: order.id, customerId: me.id, masterId: directMaster.id },
      });
      await notify({
        userId: directMaster.id,
        type: "order_assigned",
        title: "Закази нав",
        body: `${me.firstName} шуморо барои «${order.title}» интихоб кард.`,
        link: `/chat/${conversation.id}`,
      });
      return NextResponse.json({ order, conversationId: conversation.id });
    }

    const masters = await prisma.masterProfile.findMany({
      where: { categoryId: data.categoryId, setupCompleted: true, user: { isBlocked: false } },
      select: { userId: true },
      take: 40,
    });
    await Promise.all(
      masters.map((m) =>
        notify({
          userId: m.userId,
          type: "new_order",
          title: "Закази нав",
          body: `${order.title} — ${order.city}`,
          link: `/orders/${order.id}`,
        }),
      ),
    );

    return NextResponse.json({ order });
  } catch (error) {
    return handleError(error);
  }
}
