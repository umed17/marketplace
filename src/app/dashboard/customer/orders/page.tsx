"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashNav } from "@/components/DashNav";
import { Empty, StatusBadge } from "@/components/MasterCard";
import { IconPlus } from "@/components/icons";
import { PageHeader } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";

type Order = { id: string; title: string; status: string; city: string; offers?: { id: string }[] };

export default function CustomerOrdersPage() {
  const { tr } = useLocale();
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
        title={tr("myOrders")}
        subtitle={tr("myOrdersSubtitle")}
        actions={
          <Link href="/create-order" className="btn btn-primary">
            <IconPlus size={16} />
            {tr("createOrder")}
          </Link>
        }
      />
      <div className="grid gap-3">
        {orders.length === 0 ? (
          <Empty title={tr("noOrders")} text={tr("noOrdersHint")} />
        ) : (
          orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`} className="card card-interactive flex items-center justify-between gap-4 p-4">
              <div>
                <div className="font-display text-xl font-bold">{o.title}</div>
                <div className="text-sm text-[var(--color-muted-foreground)]">
                  {o.city} · {tr("offersCount", { count: o.offers?.length || 0 })}
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
