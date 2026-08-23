"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, StatusBadge } from "@/components/MasterCard";
import { formatMasterPrice } from "@/lib/utils";
import { IconBadgeCheck, IconCheck, IconHeart, IconMapPin, IconStarFill, InlineCatIcon } from "@/components/icons";
import { CardTitle, PageLoading } from "@/components/PageShell";

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

export default function MasterProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
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

  if (error) return <div className="page-wrap py-10"><p className="alert-error">{error}</p></div>;
  if (!master) return <PageLoading />;

  return (
    <div className="page-wrap grid gap-6 py-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="card p-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Avatar name={master.displayName} src={master.avatar} size={88} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-bold">{master.displayName}</h1>
                {master.isVerified && (
                  <span className="badge">
                    <IconBadgeCheck size={13} /> Тасдиқшуда
                  </span>
                )}
                {master.isOnline && (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                    Online
                  </span>
                )}
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-3 font-medium">
                <span className="inline-flex items-center gap-1 text-[var(--color-star)]">
                  <IconStarFill size={16} /> {master.rating.toFixed(1)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <IconCheck size={16} /> {master.completedOrders} заказ
                </span>
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-3 text-[var(--color-muted-foreground)]">
                <span className="inline-flex items-center gap-1">
                  <InlineCatIcon icon={master.category?.icon} name={master.category?.name} /> {master.category?.name}
                </span>
                <span className="inline-flex items-center gap-1">
                  <IconMapPin size={15} /> {master.city}
                  {master.district ? `, ${master.district}` : ""}
                </span>
                <span>{master.experience ?? 0} сол таҷриба</span>
              </p>
            </div>
          </div>
          <p className="mt-5 leading-7">{master.description}</p>
          <p className="mt-3 font-bold text-[var(--color-accent)]">{formatMasterPrice(master.priceFrom)}</p>
          {master.workingHours && <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">Соатҳои корӣ: {master.workingHours}</p>}
        </section>

        <section className="card p-6">
          <CardTitle>Хизматрасониҳо</CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {master.services.map((s) => (
              <span key={s.id} className="badge">
                {s.name}
              </span>
            ))}
            {master.services.length === 0 && <p className="text-sm text-[var(--color-muted-foreground)]">Ҳанӯз илова нашудааст.</p>}
          </div>
        </section>

        <section className="card p-6">
          <CardTitle>Portfolio</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {master.portfolio.map((p) => (
              <div key={p.id} className="media-card">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt="" className="h-40 w-full object-cover" />
                ) : (
                  <div className="media-card-placeholder h-40">Сурат нест</div>
                )}
                <p className="p-3 text-sm">{p.description}</p>
              </div>
            ))}
            {master.portfolio.length === 0 && <p className="text-sm text-[var(--color-muted-foreground)]">Корҳои анҷомдода ҳанӯз нест.</p>}
          </div>
        </section>

        <section className="card p-6">
          <CardTitle>Reviews</CardTitle>
          <div className="mt-4 space-y-4">
            {master.reviews.map((r) => (
              <div key={r.id} className="border-b border-[var(--color-border)] pb-3 last:border-0">
                <p className="font-semibold">
                  <span className="inline-flex items-center gap-1 text-[var(--color-star)]">
                    <IconStarFill size={14} /> {r.rating}
                  </span>{" "}
                  {r.customer.firstName} {r.customer.lastName}
                </p>
                <p className="mt-1 leading-relaxed">{r.comment}</p>
              </div>
            ))}
            {master.reviews.length === 0 && <p className="text-sm text-[var(--color-muted-foreground)]">Ҳанӯз отзыв нест.</p>}
          </div>
        </section>
      </div>

      <aside className="card h-fit space-y-3 p-5">
        <Link href={`/create-order?masterId=${master.id}&categoryId=${""}`} className="btn btn-primary w-full">
          Заказ додан
        </Link>
        <Link href={`/create-order?masterId=${master.id}`} className="btn btn-accent w-full">
          Ба усто муроҷиат кардан
        </Link>
        <button onClick={toggleFav} className="btn btn-ghost w-full">
          <IconHeart size={16} className={master.isFavorite ? "text-[var(--color-accent)]" : ""} />
          {master.isFavorite ? "Дар Favorites" : "Ба Favorites"}
        </button>
        <Link href="/create-order" className="link block text-center text-sm">
          Ё закази умумӣ гузоред
        </Link>
        {me && me.id !== master.id && (
          <button
            className="btn btn-ghost w-full text-sm"
            onClick={async () => {
              const reason = prompt("Сабаби report?");
              if (!reason) return;
              await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetType: "user", targetUserId: master.id, reason }),
              });
              alert("Report фиристода шуд");
            }}
          >
            Report
          </button>
        )}
        <StatusBadge status={master.isVerified ? "accepted" : "pending"} />
      </aside>
    </div>
  );
}
