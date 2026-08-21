"use client";

import Link from "next/link";
import { CategoryIcon } from "@/components/icons";
import { displayCategoryName } from "@/lib/constants";
import { PageHeader } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";

type Category = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  _count: { masters: number; orders: number };
};

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const { tr, locale } = useLocale();

  return (
    <div className="page-wrap py-8">
      <PageHeader title={tr("categories")} subtitle={tr("categoriesPageSubtitle")} />
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/masters?categoryId=${c.id}`}
            className="card card-interactive flex flex-col items-center p-5 text-center"
          >
            <CategoryIcon slug={c.slug} icon={c.icon} name={c.name} size={26} />
            <div className="mt-2 font-semibold leading-snug">{displayCategoryName(c.slug, c.name, locale)}</div>
            <div className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              {tr("categoryStats", { masters: c._count.masters, orders: c._count.orders })}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
