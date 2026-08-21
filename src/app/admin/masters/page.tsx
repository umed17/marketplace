"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

type Master = {
  id: string;
  isVerified: boolean;
  ratingAverage: number;
  city?: string | null;
  user: { firstName: string; lastName: string; isBlocked: boolean };
  category?: { name: string } | null;
};

export default function AdminMasters() {
  const { tr } = useLocale();
  const [masters, setMasters] = useState<Master[]>([]);
  async function load() {
    const d = await fetch("/api/admin/masters").then((r) => r.json());
    setMasters(d.masters || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function verify(id: string, isVerified: boolean) {
    await fetch("/api/admin/masters", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isVerified }),
    });
    load();
  }

  return (
    <div className="grid gap-3">
      {masters.map((m) => (
        <div key={m.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <div className="font-bold">
              {m.user.firstName} {m.user.lastName}
            </div>
            <div className="text-sm text-[var(--color-muted-foreground)]">
              {m.category?.name} · {m.city} · ⭐ {m.ratingAverage.toFixed(1)}
            </div>
          </div>
          <button className="btn btn-primary text-sm" onClick={() => verify(m.id, !m.isVerified)}>
            {m.isVerified ? tr("unverifyMaster") : tr("verifyMaster")}
          </button>
        </div>
      ))}
    </div>
  );
}
