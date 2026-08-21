"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashNav } from "@/components/DashNav";
import { Empty, StatusBadge } from "@/components/MasterCard";
import { IconPlus } from "@/components/icons";
import { PageHeader } from "@/components/PageShell";

type Order = { id: string; title: string; status: string; city: string; offers?: { id: string }[] };

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    fetch("/api/orders?scope=mine")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []));
  }, []);
  return (
    <div className="page-wrap py-8">
      <DashNav role="customer" />
      <PageHeader
        title="Заказҳои ман"
        subtitle="Ҳамаи заказҳои шумо"
        actions={
          <Link href="/create-order" className="btn btn-primary">
            <IconPlus size={16} />
            Заказ гузоштан
          </Link>
        }
      />
      <div className="grid gap-3">
        {orders.length === 0 ? (
          <Empty title="Заказ нест" text="Аввалин закази худро гузоред." />
        ) : (
          orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`} className="card card-interactive flex items-center justify-between gap-4 p-4">
              <div>
                <div className="font-display text-xl font-bold">{o.title}</div>
                <div className="text-sm text-[var(--color-muted-foreground)]">
                  {o.city} · {o.offers?.length || 0} пешниҳод
                </div>
              </div>
              <StatusBadge status={o.status} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
