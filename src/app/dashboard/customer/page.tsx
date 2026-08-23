"use client";

import { useEffect, useState } from "react";
import { DashNav } from "@/components/DashNav";
import { PageHeader, StatGrid } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";

export default function CustomerDashboard() {
  const { tr } = useLocale();
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
      <PageHeader
        title={tr("helloName", { name: name || tr("customerDefault") })}
        subtitle={tr("dashboardCustomerSubtitle")}
      />
      <StatGrid
        items={[
          { label: tr("myOrders"), value: stats.myOrders },
          { label: tr("statOffers"), value: stats.offers },
          { label: tr("statInProgress"), value: stats.inProgress },
          { label: tr("statCompleted"), value: stats.completed },
        ]}
      />
    </div>
  );
}
