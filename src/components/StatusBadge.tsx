"use client";

import { statusLabel as getStatusLabel } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";

const styleMap: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  published: "bg-sky-100 text-sky-800",
  receiving_offers: "bg-amber-100 text-amber-800",
  master_selected: "bg-emerald-100 text-emerald-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-rose-100 text-rose-800",
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-slate-100 text-slate-600",
  hidden: "bg-slate-100 text-slate-600",
};

export function StatusBadge({ status }: { status: string }) {
  const { locale } = useLocale();
  return <span className={`badge ${styleMap[status] || ""}`}>{getStatusLabel(locale, status)}</span>;
}
