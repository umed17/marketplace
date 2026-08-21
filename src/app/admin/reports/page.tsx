"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { statusLabel } from "@/lib/i18n";

type Report = {
  id: string;
  reason: string;
  status: string;
  targetType: string;
  reporter: { firstName: string; lastName: string };
  targetUser?: { firstName: string; lastName: string } | null;
};

export default function AdminReports() {
  const { tr, locale } = useLocale();
  const [reports, setReports] = useState<Report[]>([]);
  async function load() {
    const d = await fetch("/api/admin/reports").then((r) => r.json());
    setReports(d.reports || []);
  }
  useEffect(() => {
    load();
  }, []);
  async function setStatus(id: string, status: string) {
    await fetch("/api/admin/reports", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }
  return (
    <div className="grid gap-3">
      {reports.map((r) => (
        <div key={r.id} className="card p-4">
          <div className="font-bold">
            {r.reporter.firstName} {r.reporter.lastName} → {r.targetType} ({statusLabel(locale, r.status)})
          </div>
          <p className="mt-1">{r.reason}</p>
          <div className="mt-2 flex gap-2">
            <button className="btn btn-ghost text-sm" onClick={() => setStatus(r.id, "reviewed")}>
              {tr("reviewed")}
            </button>
            <button className="btn btn-primary text-sm" onClick={() => setStatus(r.id, "resolved")}>
              {tr("resolve")}
            </button>
          </div>
        </div>
      ))}
      {reports.length === 0 && <p className="text-[var(--color-muted-foreground)]">{tr("noReports")}</p>}
    </div>
  );
}
