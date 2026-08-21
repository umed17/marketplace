import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { notify } from "@/lib/notifications";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const me = await getCurrentUser();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      category: true,
      customer: true,
      selectedMaster: true,
      media: true,
      conversation: true,
      review: true,
      offers: {
        include: {
          master: { include: { masterProfile: { include: { category: true } } } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) return jsonError("Заказ ёфт нашуд", 404);

  const isOwner = me?.id === order.customerId;
  const isSelected = me?.id === order.selectedMasterId;
  const isAdmin = me?.role === "admin";

  return NextResponse.json({
    order: {
      ...order,
      customer: {
        id: order.customer.id,
        firstName: order.customer.firstName,
        lastName: order.customer.lastName,
        avatar: order.customer.avatar,
        phone: isOwner || isSelected || isAdmin ? order.customer.phone : undefined,
      },
    },
  });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) return jsonError("Ворид шавед", 401);

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return jsonError("Заказ ёфт нашуд", 404);
  if (order.customerId !== me.id && me.role !== "admin") return jsonError("Дастрасӣ манъ аст", 403);

  const body = await req.json();
  const updated = await prisma.order.update({
    where: { id },
    data: {
      title: body.title ?? order.title,
      description: body.description ?? order.description,
      city: body.city ?? order.city,
      district: body.district ?? order.district,
      address: body.address ?? order.address,
      budgetFrom: body.budgetFrom ?? order.budgetFrom,
      budgetTo: body.budgetTo ?? order.budgetTo,
      preferredTime: body.preferredTime ?? order.preferredTime,
      priority: body.priority ?? order.priority,
      status: body.status ?? order.status,
    },
  });

  if (body.status === "cancelled" && order.selectedMasterId) {
    await notify({
      userId: order.selectedMasterId,
      type: "order_cancelled",
      title: "Заказ бекор шуд",
      body: `«${order.title}» бекор карда шуд.`,
      link: `/orders/${order.id}`,
    });
  }

  return NextResponse.json({ order: updated });
}
