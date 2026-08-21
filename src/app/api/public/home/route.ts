import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicCategoryWhere } from "@/lib/constants";

export async function GET() {
  const [categories, masters, masterCount, orderCount, reviewCount] = await Promise.all([
    prisma.category.findMany({
      where: publicCategoryWhere,
      orderBy: { sortOrder: "asc" },
    }),
    prisma.masterProfile.findMany({
      where: { setupCompleted: true, user: { isBlocked: false } },
      include: { user: true, category: true },
      orderBy: { ratingAverage: "desc" },
      take: 6,
    }),
    prisma.masterProfile.count({ where: { setupCompleted: true, user: { isBlocked: false } } }),
    prisma.order.count({ where: { status: { not: "draft" } } }),
    prisma.review.count(),
  ]);

  return NextResponse.json({
    categories,
    masters,
    stats: {
      masterCount,
      orderCount,
      categoryCount: categories.length,
      reviewCount,
    },
  });
}
