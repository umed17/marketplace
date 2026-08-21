"use client";

import { useEffect, useState } from "react";
import { DashNav } from "@/components/DashNav";
import { PageHeader, StatGrid } from "@/components/PageShell";

export default function CustomerDashboard() {
  const [name, setName] = useState("");
  const [stats, setStats] = useState({ myOrders: 0, offers: 0, inProgress: 0, completed: 0 });

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
      <DashNav role="customer" />
      <PageHeader title={`Салом, ${name || "муштарӣ"}`} subtitle="Хулосаи заказҳо ва пешниҳодҳо" />
      <StatGrid
        items={[
          { label: "Заказҳои ман", value: stats.myOrders },
          { label: "Пешниҳодҳо", value: stats.offers },
          { label: "Дар иҷроиш", value: stats.inProgress },
          { label: "Анҷомшуда", value: stats.completed },
        ]}
      />
    </div>
  );
}
