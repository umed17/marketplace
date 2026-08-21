"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashNav } from "@/components/DashNav";
import { Empty, StatusBadge } from "@/components/MasterCard";
import { PageHeader } from "@/components/PageShell";

type Offer = {
  id: string;
  price: number;
  status: string;
  message: string;
  order: { id: string; title: string; status: string };
};

export default function MyOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  useEffect(() => {
    fetch("/api/offers")
      .then((r) => r.json())
      .then((d) => setOffers(d.offers || []));
  }, []);

  return (
    <div className="page-wrap py-8">
      <DashNav role="master" />
      <PageHeader title="Пешниҳодҳои ман" subtitle="Ҳолати пешниҳодҳои фиристода" />
      <div className="grid gap-3">
        {offers.length === 0 ? (
          <Empty title="Пешниҳод нест" text="Ба заказҳои нав пешниҳод фиристед." />
        ) : (
          offers.map((o) => (
            <Link key={o.id} href={`/orders/${o.order.id}`} className="card card-interactive p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-display text-xl font-bold">{o.order.title}</div>
                  <div className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                    <span className="font-semibold text-[var(--color-accent)]">{o.price} сомонӣ</span> · {o.message}
                  </div>
                </div>
                <StatusBadge status={o.status} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
