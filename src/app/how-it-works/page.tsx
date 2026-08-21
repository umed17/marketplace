"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";

const stepKeys: { title: TranslationKey; desc: TranslationKey }[] = [
  { title: "hiw1Title", desc: "hiw1Desc" },
  { title: "hiw2Title", desc: "hiw2Desc" },
  { title: "hiw3Title", desc: "hiw3Desc" },
  { title: "hiw4Title", desc: "hiw4Desc" },
  { title: "hiw5Title", desc: "hiw5Desc" },
  { title: "hiw6Title", desc: "hiw6Desc" },
];

export default function HowItWorksPage() {
  const { tr } = useLocale();

  return (
    <div className="page-wrap py-10">
      <PageHeader title={tr("howItWorks")} subtitle={tr("howItWorksPageSubtitle")} />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {stepKeys.map((step, i) => (
          <div key={i} className="card p-5">
            <div className="inline-flex rounded-full bg-[var(--color-muted-bg)] px-3 py-1 text-sm font-bold text-[var(--color-accent)]">
              {tr("stepNumber", { n: i + 1 })}
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold">{tr(step.title)}</h2>
            <p className="mt-2 leading-relaxed text-[var(--color-muted-foreground)]">{tr(step.desc)}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/register" className="btn btn-primary">
          {tr("register")}
        </Link>
        <Link href="/create-order" className="btn btn-accent">
          {tr("createOrder")}
        </Link>
      </div>
    </div>
  );
}
