import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  if (q.length < 2) return NextResponse.json({ masters: [], orders: [], services: [] });

  const [masters, orders, services] = await Promise.all([
    prisma.masterProfile.findMany({
      where: {
        setupCompleted: true,
        user: { isBlocked: false },
        OR: [
          { displayName: { contains: q } },
          { description: { contains: q } },
          { user: { firstName: { contains: q } } },
          { user: { lastName: { contains: q } } },
        ],
      },
      include: { user: true, category: true },
      take: 8,
    }),
    prisma.order.findMany({
      where: {
        status: { in: ["published", "receiving_offers"] },
        OR: [{ title: { contains: q } }, { description: { contains: q } }],
      },
      include: { category: true },
      take: 8,
    }),
    prisma.service.findMany({
      where: { name: { contains: q } },
      include: { master: { include: { user: true, category: true } } },
      take: 8,
    }),
  ]);

  return NextResponse.json({ masters, orders, services });
}
