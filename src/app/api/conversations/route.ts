import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return jsonError("Ворид шавед", 401);

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ customerId: me.id }, { masterId: me.id }] },
    include: {
      order: true,
      customer: true,
      master: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  const items = await Promise.all(
    conversations.map(async (c) => {
      const unread = await prisma.message.count({
        where: { conversationId: c.id, isRead: false, NOT: { senderId: me.id } },
      });
      const other = c.customerId === me.id ? c.master : c.customer;
      return {
        id: c.id,
        order: { id: c.order.id, title: c.order.title, status: c.order.status },
        other: {
          id: other.id,
          firstName: other.firstName,
          lastName: other.lastName,
          avatar: other.avatar,
          lastSeenAt: other.lastSeenAt,
        },
        lastMessage: c.messages[0] || null,
        unread,
        updatedAt: c.updatedAt,
      };
    }),
  );

  return NextResponse.json({ conversations: items });
}
