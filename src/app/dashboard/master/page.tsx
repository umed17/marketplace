"use client";

import { useEffect, useState } from "react";
import { DashNav } from "@/components/DashNav";
import { PageHeader, StatGrid } from "@/components/PageShell";

export default function MasterDashboard() {
  const [name, setName] = useState("");
  const [stats, setStats] = useState({ newOrders: 0, myOffers: 0, inProgress: 0, completed: 0, rating: 0 });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setName(d.user?.firstName || ""));
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => setStats(d.stats || stats));
  }, []);

  return (
    <div className="page-wrap py-8">
      <DashNav role="master" />
      <PageHeader title={`Салом, ${name || "усто"}`} subtitle="Хулосаи заказҳо, пешниҳодҳо ва рейтинг" />
      <StatGrid
        items={[
          { label: "Заказҳои нав", value: stats.newOrders },
          { label: "Пешниҳодҳои ман", value: stats.myOffers },
          { label: "Дар иҷроиш", value: stats.inProgress },
          { label: "Анҷомшуда", value: stats.completed },
          { label: "Рейтинг", value: Number(stats.rating).toFixed(1) },
        ]}
      />
    </div>
  );
}
