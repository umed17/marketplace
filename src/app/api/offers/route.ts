import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return jsonError("Ворид шавед", 401);
  const offers = await prisma.orderOffer.findMany({
    where: { masterId: me.id },
    include: { order: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ offers });
}
