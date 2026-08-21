import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { displayCategoryName, publicCategoryWhere } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const withCounts = req.nextUrl.searchParams.get("counts") === "1";

  const rows = await prisma.category.findMany({
    where: publicCategoryWhere,
    orderBy: { sortOrder: "asc" },
    ...(withCounts ? { include: { _count: { select: { masters: true, orders: true } } } } : {}),
  });
  const categories = rows.map((c) => ({ ...c, name: displayCategoryName(c.slug, c.name) }));
  return NextResponse.json({ categories });
}
