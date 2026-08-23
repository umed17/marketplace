"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MasterCard, Empty, type MasterCardData } from "@/components/MasterCard";
import { IconHeart } from "@/components/icons";
import { PageHeader } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";

export default function FavoritesPage() {
  const { tr } = useLocale();
  const [masters, setMasters] = useState<MasterCardData[]>([]);
  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => {
        const items = (d.favorites || []).map(
          (f: {
            masterId: string;
            master: {
              firstName: string;
              lastName: string;
              avatar?: string;
              masterProfile?: {
                ratingAverage?: number;
                completedOrders?: number;
                city?: string;
                priceFrom?: number;
                isVerified?: boolean;
                category?: { name: string; icon?: string };
              };
            };
          }) => ({
            id: f.masterId,
            displayName: `${f.master.firstName} ${f.master.lastName}`,
            avatar: f.master.avatar,
            rating: f.master.masterProfile?.ratingAverage || 0,
            completedOrders: f.master.masterProfile?.completedOrders || 0,
            category: f.master.masterProfile?.category,
            city: f.master.masterProfile?.city,
            priceFrom: f.master.masterProfile?.priceFrom,
            isVerified: f.master.masterProfile?.isVerified,
            isFavorite: true,
          }),
        );
        setMasters(items);
      });
  }, []);

  return (
    <div className="page-wrap py-8">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            <IconHeart size={28} className="text-[var(--color-accent)]" aria-hidden="true" />
            {tr("favorites")}
          </span>
        }
        subtitle={tr("favoritesSubtitle")}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {masters.length === 0 ? (
          <Empty title="Холӣ" text="Устоҳои дӯстдоштаро ин ҷо нигоҳ доред." />
        ) : (
          masters.map((m) => <MasterCard key={m.id} master={m} />)
        )}
      </div>
    </div>
  );
}
