"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { displayCategoryName } from "@/lib/constants";
import {
  CategoryIcon,
  IconCheck,
  IconMapPin,
  IconPlus,
  IconSearch,
  IconStarFill,
  InlineCatIcon,
} from "@/components/icons";

type Category = { id: string; slug: string; name: string; icon: string | null };
type Master = {
  id: string;
  userId: string;
  displayName: string | null;
  ratingAverage: number;
  completedOrders: number;
  city: string | null;
  priceFrom: number | null;
  user: { firstName: string; lastName: string };
  category: { name: string; icon: string | null; slug: string } | null;
};

type Props = {
  categories: Category[];
  masters: Master[];
  stats: { masterCount: number; orderCount: number; categoryCount: number; reviewCount: number };
};

export function HomePageClient({ categories, masters, stats }: Props) {
  const { tr, locale } = useLocale();

  const statItems = [
    { value: stats.masterCount, label: tr("statActiveMasters") },
    { value: stats.orderCount, label: tr("statPublishedOrders") },
    { value: stats.categoryCount, label: tr("statCategoryCount") },
    { value: stats.reviewCount, label: tr("statReviewCount") },
  ];

  const steps = [tr("step1"), tr("step2"), tr("step3"), tr("step4"), tr("step5")];

  return (
    <div>
      <section className="hero-section">
        <div className="page-wrap grid gap-10 py-12 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-16">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-sm font-semibold text-[var(--color-primary)]">
              {tr("heroBadge")}
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">{tr("heroTitle")}</h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--color-muted-foreground)]">{tr("heroSubtitle")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/masters" className="btn btn-primary text-base">
                <IconSearch size={18} />
                {tr("searchMaster")}
              </Link>
              <Link href="/create-order" className="btn btn-accent text-base">
                <IconPlus size={18} />
                {tr("createOrder")}
              </Link>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-2xl font-bold">{tr("howItWorks")}</h2>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
              {steps.map((text, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-muted-bg)] text-xs font-bold text-[var(--color-primary)]">
                    {i + 1}
                  </span>
                  {text}
                </li>
              ))}
            </ol>
            <Link href="/how-it-works" className="link mt-5 inline-block text-sm">
              {tr("details")}
            </Link>
          </div>
        </div>
      </section>

      <section className="section-muted py-10">
        <div className="page-wrap">
          <h2 className="sr-only">{tr("statsSrOnly")}</h2>
          <div className="stat-grid">
            {statItems.map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-wrap py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold">{tr("categories")}</h2>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{tr("categoriesSubtitle")}</p>
          </div>
          <Link href="/categories" className="link shrink-0 text-sm">
            {tr("viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/masters?categoryId=${c.id}`}
              className="card card-interactive flex flex-col items-center p-4 text-center"
            >
              <CategoryIcon slug={c.slug} icon={c.icon} name={c.name} size={24} />
              <div className="mt-2 text-sm font-semibold leading-snug">{displayCategoryName(c.slug, c.name, locale)}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-muted py-12">
        <div className="page-wrap">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold">{tr("bestMasters")}</h2>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{tr("bestMastersSubtitle")}</p>
            </div>
            <Link href="/masters" className="link shrink-0 text-sm">
              {tr("viewAllMasters")}
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {masters.map((m) => (
              <Link key={m.id} href={`/masters/${m.userId}`} className="card card-interactive p-5">
                <div className="font-display text-xl font-bold">
                  {m.displayName || `${m.user.firstName} ${m.user.lastName}`}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted-foreground)]">
                  <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-star)]">
                    <IconStarFill size={14} /> {m.ratingAverage.toFixed(1)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <IconCheck size={14} /> {tr("ordersCount", { count: m.completedOrders })}
                  </span>
                </p>
                <p className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1">
                    <InlineCatIcon name={m.category?.name} icon={m.category?.icon} slug={m.category?.slug} />
                    {displayCategoryName(m.category?.slug, m.category?.name, locale)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[var(--color-muted-foreground)]">
                    <IconMapPin size={14} /> {m.city}
                  </span>
                </p>
                <p className="mt-3 font-bold text-[var(--color-accent)]">
                  {m.priceFrom == null ? tr("priceNegotiable") : tr("priceFromSomoni", { price: m.priceFrom })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="page-wrap pb-16 pt-4">
        <div className="card flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">{tr("ctaTitle")}</h2>
            <p className="mt-2 max-w-lg text-[var(--color-muted-foreground)]">{tr("ctaSubtitle")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="btn btn-primary">
              {tr("register")}
            </Link>
            <Link href="/create-order" className="btn btn-accent">
              {tr("createOrder")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
