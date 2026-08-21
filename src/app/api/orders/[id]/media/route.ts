import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) return jsonError("Ворид шавед", 401);
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.customerId !== me.id) return jsonError("Дастрасӣ манъ аст", 403);
  const { url, type } = await req.json();
  const media = await prisma.orderMedia.create({
    data: { orderId: id, url, type: type === "video" ? "video" : "image" },
  });
  return NextResponse.json({ media });
}
