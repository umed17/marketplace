"use client";

import { useEffect, useState } from "react";
import { DashNav } from "@/components/DashNav";
import { PageHeader, StatGrid } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";

export default function MasterDashboard() {
  const { tr } = useLocale();
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
      <PageHeader
        title={tr("helloName", { name: name || tr("masterDefault") })}
        subtitle={tr("dashboardMasterSubtitle")}
      />
      <StatGrid
        items={[
          { label: tr("newOrders"), value: stats.newOrders },
          { label: tr("myOffers"), value: stats.myOffers },
          { label: tr("statInProgress"), value: stats.inProgress },
          { label: tr("statCompleted"), value: stats.completed },
          { label: tr("statRating"), value: Number(stats.rating).toFixed(1) },
        ]}
      />
    </div>
  );
}
