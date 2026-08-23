"use client";

import { ReactNode } from "react";
import { useLocale } from "@/components/LocaleProvider";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold md:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-[var(--color-muted-foreground)]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function PageLoading({ message }: { message?: string }) {
  const { tr } = useLocale();
  return (
    <div className="page-wrap py-10">
      <div className="card flex items-center justify-center gap-3 p-10 text-[var(--color-muted-foreground)]" role="status">
        <span className="skeleton h-5 w-5 rounded-full" aria-hidden="true" />
        {message || tr("loading")}
      </div>
    </div>
  );
}

export function StatGrid({ items }: { items: { label: string; value: string | number }[] }) {
  return (
    <div className="stat-grid">
      {items.map((item) => (
        <div key={item.label} className="stat-card">
          <div className="stat-value">{item.value}</div>
          <div className="stat-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-xl font-bold md:text-2xl">{children}</h2>;
}
