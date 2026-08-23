"use client";

import Link from "next/link";
import { formatMasterPrice } from "@/lib/utils";
import { IconBadgeCheck, IconCheck, IconMapPin, IconStarFill, InlineCatIcon } from "@/components/icons";
import { useLocale } from "@/components/LocaleProvider";

export { StatusBadge } from "@/components/StatusBadge";

export type MasterCardData = {
  id: string;
  displayName: string;
  avatar?: string | null;
  rating: number;
  completedOrders: number;
  category?: { name: string; icon?: string | null; slug?: string | null } | null;
  city?: string | null;
  priceFrom?: number | null;
  isVerified?: boolean;
  isOnline?: boolean;
  isFavorite?: boolean;
};

export function Avatar({ name, src, size = 56 }: { name: string; src?: string | null; size?: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className="grid shrink-0 place-items-center overflow-hidden rounded-xl bg-[var(--color-primary)] font-semibold text-white"
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : initials}
    </div>
  );
}

export function MasterCard({ master }: { master: MasterCardData }) {
  const { locale, tr } = useLocale();

  return (
    <article className="card flex flex-col gap-4 p-5 transition-colors hover:border-[var(--color-secondary)]">
      <div className="flex gap-4">
        <Avatar name={master.displayName} src={master.avatar} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-display text-xl font-bold">{master.displayName}</h3>
            {master.isVerified && (
              <span className="badge">
                <IconBadgeCheck size={13} /> {tr("verified")}
              </span>
            )}
            {master.isOnline && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                {tr("online")}
              </span>
            )}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-sm font-medium text-[var(--color-muted-foreground)]">
            <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-star)]">
              <IconStarFill size={14} /> {master.rating?.toFixed?.(1) ?? "0.0"}
            </span>
            <span className="inline-flex items-center gap-1">
              <IconCheck size={14} /> {tr("ordersCount", { count: master.completedOrders })}
            </span>
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1">
              <InlineCatIcon icon={master.category?.icon} name={master.category?.name} slug={master.category?.slug} />{" "}
              {master.category?.name || tr("masterRole")}
            </span>
            <span className="inline-flex items-center gap-1 text-[var(--color-muted-foreground)]">
              <IconMapPin size={14} /> {master.city || "—"}
            </span>
          </p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
        <div className="font-bold text-[var(--color-accent)]">{formatMasterPrice(master.priceFrom, locale)}</div>
        <Link href={`/masters/${master.id}`} className="btn btn-primary text-sm">
          {tr("viewProfile")}
        </Link>
      </div>
    </article>
  );
}

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="card p-10 text-center">
      <h3 className="font-display text-2xl font-bold">{title}</h3>
      <p className="mt-2 text-[var(--color-muted-foreground)]">{text}</p>
    </div>
  );
}

export function LoadingCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5">
          <div className="flex gap-4">
            <div className="skeleton h-14 w-14 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-5 w-2/3" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-4 w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
