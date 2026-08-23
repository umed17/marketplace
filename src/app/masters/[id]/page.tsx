"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, StatusBadge } from "@/components/MasterCard";
import { formatMasterPrice } from "@/lib/utils";
import { IconBadgeCheck, IconCheck, IconHeart, IconMapPin, IconStarFill, InlineCatIcon } from "@/components/icons";
import { CardTitle, PageLoading } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  customer: { firstName: string; lastName: string };
};

type Master = {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  city?: string;
  district?: string;
  experience?: number;
  description?: string;
  priceFrom?: number;
  workingHours?: string;
  isVerified?: boolean;
  rating: number;
  completedOrders: number;
  category?: { name: string; icon?: string };
  services: { id: string; name: string }[];
  portfolio: { id: string; imageUrl: string; description?: string }[];
  reviews: Review[];
  isFavorite?: boolean;
  isOnline?: boolean;
};

function MasterActions({
  master,
  me,
  onToggleFav,
  tr,
}: {
  master: Master;
  me: { id: string; role: string } | null;
  onToggleFav: () => void;
  tr: (key: import("@/lib/i18n").TranslationKey, vars?: Record<string, string | number>) => string;
}) {
  const router = useRouter();

  return (
    <div className="space-y-2">
      <Link href={`/create-order?masterId=${master.id}`} className="btn btn-primary w-full text-sm">
        {tr("placeOrder")}
      </Link>
      <Link href={`/create-order?masterId=${master.id}`} className="btn btn-accent w-full text-sm">
        {tr("contactMaster")}
      </Link>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={onToggleFav} className="btn btn-ghost w-full text-sm">
          <IconHeart size={15} className={master.isFavorite ? "text-[var(--color-accent)]" : ""} />
          {master.isFavorite ? tr("inFavorites") : tr("addToFavorites")}
        </button>
        {me && me.id !== master.id && (
          <button
            className="btn btn-ghost w-full text-sm"
            onClick={async () => {
              const reason = prompt(tr("reportReason"));
              if (!reason) return;
              await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetType: "user", targetUserId: master.id, reason }),
              });
              alert(tr("reportSent"));
            }}
          >
            {tr("report")}
          </button>
        )}
      </div>
      <Link href="/create-order" className="link block text-center text-xs">
        {tr("orGeneralOrder")}
      </Link>
      {!me && (
        <button className="btn btn-ghost w-full text-sm" onClick={() => router.push("/login")}>
          {tr("login")}
        </button>
      )}
    </div>
  );
}

export default function MasterProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { tr, locale } = useLocale();
  const [master, setMaster] = useState<Master | null>(null);
  const [me, setMe] = useState<{ id: string; role: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/masters/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setMaster(d.master);
      });
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMe(d?.user ?? null));
  }, [id]);

  async function toggleFav() {
    if (!me) return router.push("/login");
    if (master?.isFavorite) {
      await fetch(`/api/favorites?masterId=${master.id}`, { method: "DELETE" });
    } else {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterId: master?.id }),
      });
    }
    setMaster((m) => (m ? { ...m, isFavorite: !m.isFavorite } : m));
  }

  if (error) {
    return (
      <div className="page-wrap py-10">
        <p className="alert-error">{error}</p>
      </div>
    );
  }
  if (!master) return <PageLoading />;

  return (
    <div className="page-wrap py-4 sm:py-8">
      <div className="grid gap-4 lg:grid-cols-[1fr_260px] lg:gap-6">
        <div className="space-y-4 lg:space-y-6">
          <section className="card p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Avatar name={master.displayName} src={master.avatar} size={72} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-bold sm:text-3xl">{master.displayName}</h1>
                  {master.isVerified && (
                    <span className="badge">
                      <IconBadgeCheck size={13} /> {tr("verified")}
                    </span>
                  )}
                  {master.isOnline && (
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                      {tr("online")}
                    </span>
                  )}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium">
                  <span className="inline-flex items-center gap-1 text-[var(--color-star)]">
                    <IconStarFill size={14} /> {master.rating.toFixed(1)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <IconCheck size={14} /> {tr("ordersCount", { count: master.completedOrders })}
                  </span>
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-muted-foreground)]">
                  <span className="inline-flex items-center gap-1">
                    <InlineCatIcon icon={master.category?.icon} name={master.category?.name} /> {master.category?.name}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <IconMapPin size={14} /> {master.city}
                    {master.district ? `, ${master.district}` : ""}
                  </span>
                  <span>{tr("yearsExperience", { count: master.experience ?? 0 })}</span>
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 sm:text-base">{master.description}</p>
            <p className="mt-3 font-bold text-[var(--color-accent)]">{formatMasterPrice(master.priceFrom, locale)}</p>
            {master.workingHours && (
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                {tr("workingHoursLabel")}: {master.workingHours}
              </p>
            )}
          </section>

          <div className="card p-3 lg:hidden">
            <MasterActions master={master} me={me} onToggleFav={toggleFav} tr={tr} />
          </div>

          <section className="card p-4 sm:p-6">
            <CardTitle>{tr("services")}</CardTitle>
            <div className="mt-3 flex flex-wrap gap-2">
              {master.services.map((s) => (
                <span key={s.id} className="badge">
                  {s.name}
                </span>
              ))}
              {master.services.length === 0 && (
                <p className="text-sm text-[var(--color-muted-foreground)]">{tr("servicesEmpty")}</p>
              )}
            </div>
          </section>

          <section className="card p-4 sm:p-6">
            <CardTitle>{tr("portfolio")}</CardTitle>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
              {master.portfolio.map((p) => (
                <div key={p.id} className="media-card">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" className="h-36 w-full object-cover sm:h-40" />
                  ) : (
                    <div className="media-card-placeholder h-36 sm:h-40">Сурат нест</div>
                  )}
                  <p className="p-3 text-sm">{p.description}</p>
                </div>
              ))}
              {master.portfolio.length === 0 && (
                <p className="text-sm text-[var(--color-muted-foreground)]">{tr("portfolioEmpty")}</p>
              )}
            </div>
          </section>

          <section className="card p-4 sm:p-6">
            <CardTitle>{tr("reviewsSection")}</CardTitle>
            <div className="mt-4 space-y-4">
              {master.reviews.map((r) => (
                <div key={r.id} className="border-b border-[var(--color-border)] pb-3 last:border-0">
                  <p className="font-semibold">
                    <span className="inline-flex items-center gap-1 text-[var(--color-star)]">
                      <IconStarFill size={14} /> {r.rating}
                    </span>{" "}
                    {r.customer.firstName} {r.customer.lastName}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{r.comment}</p>
                </div>
              ))}
              {master.reviews.length === 0 && (
                <p className="text-sm text-[var(--color-muted-foreground)]">{tr("noReviewsYet")}</p>
              )}
            </div>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20 card p-4">
            <MasterActions master={master} me={me} onToggleFav={toggleFav} tr={tr} />
            <div className="mt-3">
              <StatusBadge status={master.isVerified ? "accepted" : "pending"} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
