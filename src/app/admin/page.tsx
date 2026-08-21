"use client";

import { useEffect, useState } from "react";
import { StatGrid } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";

const statKeys: Record<string, TranslationKey> = {
  users: "statUsers",
  masters: "statMasters",
  orders: "statOrders",
  reviews: "statReviews",
  reports: "statReports",
};

export default function AdminHome() {
  const { tr } = useLocale();
  const [stats, setStats] = useState({ users: 0, masters: 0, orders: 0, reviews: 0, reports: 0 });
  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.stats || stats));
  }, []);
  return (
    <StatGrid
      items={Object.entries(stats).map(([k, v]) => ({
        label: tr(statKeys[k] || "statUsers"),
        value: v,
      }))}
    />
  );
}
