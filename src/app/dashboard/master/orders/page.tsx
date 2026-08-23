"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashNav } from "@/components/DashNav";
import { Empty } from "@/components/MasterCard";
import { formatSomoni } from "@/lib/utils";
import { IconClock, IconMapPin, IconWallet, InlineCatIcon } from "@/components/icons";
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
  category?: { icon?: string; name: string };
};

export default function NewOrdersPage() {
  const { tr, locale } = useLocale();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/orders?scope=master")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []));
  }, []);

  return (
    <div className="page-wrap py-8">
      <DashNav role="master" />
      <PageHeader title={tr("newOrders")} subtitle={tr("newOrdersSubtitle")} />
      <div className="grid gap-4">
        {orders.length === 0 ? (
          <Empty title={tr("noNewOrders")} text={tr("noNewOrdersHint")} />
        ) : (
          orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`} className="card card-interactive p-5">
              <h2 className="font-display flex items-center gap-2 text-xl font-bold md:text-2xl">
                <InlineCatIcon icon={o.category?.icon} name={o.category?.name} /> {o.title}
              </h2>
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
              <p className="mt-2 line-clamp-2">{o.description}</p>
              <span className="link mt-3 inline-block text-sm">{tr("viewOrder")}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
