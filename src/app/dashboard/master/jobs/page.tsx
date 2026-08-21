"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashNav } from "@/components/DashNav";
import { Empty, StatusBadge } from "@/components/MasterCard";
import { PageHeader } from "@/components/PageShell";

type Order = { id: string; title: string; status: string; city: string };

export default function MasterJobsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    fetch("/api/orders?scope=assigned")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []));
  }, []);
  return (
    <div className="page-wrap py-8">
      <DashNav role="master" />
      <PageHeader title="Заказҳои ман" subtitle="Заказҳои интихобшуда ва дар иҷроиш" />
      <div className="grid gap-3">
        {orders.length === 0 ? (
          <Empty title="Заказ нест" text="Вақте муштарӣ шуморо интихоб кунад, ин ҷо пайдо мешавад." />
        ) : (
          orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`} className="card card-interactive flex items-center justify-between gap-4 p-4">
              <div>
                <div className="font-display text-xl font-bold">{o.title}</div>
                <div className="text-sm text-[var(--color-muted-foreground)]">{o.city}</div>
              </div>
              <StatusBadge status={o.status} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
