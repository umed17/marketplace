import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) return jsonError("Ворид шавед", 401);

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { order: true, customer: true, master: true },
  });
  if (!conversation) return jsonError("Chat ёфт нашуд", 404);
  if (conversation.customerId !== me.id && conversation.masterId !== me.id && me.role !== "admin") {
    return jsonError("Дастрасӣ манъ аст", 403);
  }

  const other = conversation.customerId === me.id ? conversation.master : conversation.customer;
  return NextResponse.json({
    conversation: {
      id: conversation.id,
      order: conversation.order,
      other: {
        id: other.id,
        firstName: other.firstName,
        lastName: other.lastName,
        avatar: other.avatar,
        lastSeenAt: other.lastSeenAt,
      },
    },
  });
}
