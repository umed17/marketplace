import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return jsonError("Ворид шавед", 401);
  const notifications = await prisma.notification.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unread = notifications.filter((n) => !n.isRead).length;
  return NextResponse.json({ notifications, unread });
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Ворид шавед", 401);
  const body = await req.json().catch(() => ({}));
  if (body.id) {
    await prisma.notification.updateMany({
      where: { id: body.id, userId: me.id },
      data: { isRead: true },
    });
  } else {
    await prisma.notification.updateMany({
      where: { userId: me.id, isRead: false },
      data: { isRead: true },
    });
  }
  return NextResponse.json({ ok: true });
}
