"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Empty, StatusBadge } from "@/components/MasterCard";
import { formatSomoni } from "@/lib/utils";
import { IconClock, IconMapPin, IconPlus, IconWallet, InlineCatIcon } from "@/components/icons";
import { PageHeader } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";

type Order = {
  id: string;
  title: string;
  description: string;
  city: string;
  district?: string;
  budgetFrom?: number;
  budgetTo?: number;
  preferredTime?: string;
  status: string;
  category?: { name: string; icon?: string };
};

export default function OrdersPage() {
  const { locale, tr } = useLocale();
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch(`/api/orders?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []));
  }, [q]);

  return (
    <div className="page-wrap py-8">
      <PageHeader
        title={tr("orders")}
        subtitle={tr("ordersSubtitle")}
        actions={
          <Link href="/create-order" className="btn btn-primary">
            <IconPlus size={16} />
            {tr("createOrder")}
          </Link>
        }
      />
      <input
        className="input"
        placeholder={tr("searchOrders")}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label={tr("searchOrders")}
      />
      <div className="mt-6 grid gap-4">
        {orders.length === 0 ? (
          <Empty title={tr("noOpenOrders")} text={tr("noOpenOrdersHint")} />
        ) : (
          orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`} className="card card-interactive p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display flex items-center gap-2 text-xl font-bold md:text-2xl">
                  <InlineCatIcon icon={o.category?.icon} name={o.category?.name} /> {o.title}
                </h2>
                <StatusBadge status={o.status} />
              </div>
              <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted-foreground)]">
                <span className="inline-flex items-center gap-1">
                  <IconMapPin size={14} /> {o.city}
                  {o.district ? `, ${o.district}` : ""}
                </span>
                <span className="inline-flex items-center gap-1">
                  <IconWallet size={14} /> {formatSomoni(o.budgetFrom, locale)}–{formatSomoni(o.budgetTo, locale)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <IconClock size={14} /> {o.preferredTime || "—"}
                </span>
              </p>
              <p className="mt-3 line-clamp-2 text-[var(--color-ink)]">{o.description}</p>
              <span className="link mt-3 inline-block text-sm">{tr("viewOrder")}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
