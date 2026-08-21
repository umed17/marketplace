"use client";

import { AdminNav } from "@/components/AdminNav";
import { useLocale } from "@/components/LocaleProvider";

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const { tr } = useLocale();
  return (
    <div className="page-wrap py-8">
      <h1 className="font-display text-3xl font-bold text-[var(--color-foreground)]">{tr("adminPanel")}</h1>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{tr("adminSubtitle")}</p>
      <AdminNav />
      {children}
    </div>
  );
}
