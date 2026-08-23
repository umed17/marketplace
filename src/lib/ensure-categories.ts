import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

let ensured = false;

/** Upsert default categories when DB is empty (e.g. fresh Neon after deploy). */
export async function ensureCategories() {
  if (ensured) return;

  const count = await prisma.category.count({
    where: { isActive: true, slug: { not: "digar" } },
  });

  if (count > 0) {
    ensured = true;
    return;
  }

  for (const [index, cat] of DEFAULT_CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: index, isActive: true },
      create: { ...cat, sortOrder: index, isActive: true },
    });
  }

  await prisma.category.updateMany({
    where: { slug: "digar" },
    data: { isActive: false },
  });

  ensured = true;
}
