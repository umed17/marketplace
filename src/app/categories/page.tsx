import { fetchBackend, isFrontendDeploy } from "@/lib/server-fetch";
import { prisma } from "@/lib/prisma";
import { publicCategoryWhere } from "@/lib/constants";
import { CategoriesClient } from "./CategoriesClient";

export const dynamic = "force-dynamic";

type CategoryRow = Parameters<typeof CategoriesClient>[0]["categories"][number];

async function loadCategories(): Promise<CategoryRow[]> {
  if (isFrontendDeploy()) {
    const data = await fetchBackend<{ categories: CategoryRow[] }>("/api/categories?counts=1");
    return data.categories;
  }

  return prisma.category.findMany({
    where: publicCategoryWhere,
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { masters: true, orders: true } } },
  });
}

export default async function CategoriesPage() {
  const categories = await loadCategories();
  return <CategoriesClient categories={categories} />;
}
