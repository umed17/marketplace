import { PrismaClient } from "@prisma/client";
import { DEFAULT_CATEGORIES } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
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

  console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
