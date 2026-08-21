import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { messageSchema } from "@/lib/validations";
import { handleError, jsonError } from "@/lib/api";
import { inspectMessage } from "@/lib/contact-guard";
import { CONTACT_WARNING } from "@/lib/constants";
import { notify } from "@/lib/notifications";

type Ctx = { params: Promise<{ id: string }> };

async function loadConversation(id: string, userId: string, isAdmin: boolean) {
  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation) throw Object.assign(new Error("Chat ёфт нашуд"), { status: 404 });
  if (conversation.customerId !== userId && conversation.masterId !== userId && !isAdmin) {
    throw Object.assign(new Error("Дастрасӣ манъ аст"), { status: 403 });
  }
  return conversation;
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const me = await getCurrentUser();
    if (!me) return jsonError("Ворид шавед", 401);
    await loadConversation(id, me.id, me.role === "admin");

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    await prisma.message.updateMany({
      where: { conversationId: id, NOT: { senderId: me.id }, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const me = await getCurrentUser();
    if (!me) return jsonError("Ворид шавед", 401);
    const conversation = await loadConversation(id, me.id, me.role === "admin");

    const body = await req.json();
    const data = messageSchema.parse(body);
    const inspection = inspectMessage(data.body);

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: me.id,
        body: data.body,
        attachmentUrl: body.attachmentUrl || null,
        hasContactHint: inspection.hasContact,
      },
    });

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    const otherId = conversation.customerId === me.id ? conversation.masterId : conversation.customerId;
    await notify({
      userId: otherId,
      type: "chat_message",
      title: "Паёми нав",
      body: `${me.firstName}: ${data.body.slice(0, 80)}`,
      link: `/chat/${id}`,
    });

    return NextResponse.json({
      message,
      warning: inspection.hasContact ? CONTACT_WARNING : null,
      hits: inspection.hits,
    });
  } catch (error) {
    return handleError(error);
  }
}
