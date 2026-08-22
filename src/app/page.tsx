import { fetchBackend, isFrontendDeploy } from "@/lib/server-fetch";
import { prisma } from "@/lib/prisma";
import { publicCategoryWhere } from "@/lib/constants";
import { HomePageClient } from "./HomePageClient";

export const dynamic = "force-dynamic";

type HomeData = {
  categories: Parameters<typeof HomePageClient>[0]["categories"];
  masters: Parameters<typeof HomePageClient>[0]["masters"];
  stats: Parameters<typeof HomePageClient>[0]["stats"];
};

async function loadHomeData(): Promise<HomeData> {
  if (isFrontendDeploy()) {
    return fetchBackend<HomeData>("/api/public/home");
  }

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

  return {
    categories,
    masters,
    stats: {
      masterCount,
      orderCount,
      categoryCount: categories.length,
      reviewCount,
    },
  };
}

export default async function HomePage() {
  const { categories, masters, stats } = await loadHomeData();
  return <HomePageClient categories={categories} masters={masters} stats={stats} />;
}
