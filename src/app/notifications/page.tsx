"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Empty } from "@/components/MasterCard";
import { timeAgo } from "@/lib/utils";
import { PageHeader } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";

type N = { id: string; title: string; body: string; link?: string | null; isRead: boolean; createdAt: string };

export default function NotificationsPage() {
  const { tr, locale } = useLocale();
  const [items, setItems] = useState<N[]>([]);

  async function load() {
    const d = await fetch("/api/notifications").then((r) => r.json());
    setItems(d.notifications || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function readAll() {
    await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    load();
  }

  return (
    <div className="page-wrap py-8">
      <PageHeader
        title={tr("notifications")}
        subtitle={tr("notificationsSubtitle")}
        actions={
          <button className="btn btn-ghost text-sm" onClick={readAll}>
            {tr("markAllRead")}
          </button>
        }
      />
      <div className="grid gap-3">
        {items.length === 0 ? (
          <Empty title={tr("noNotifications")} text={tr("noNotificationsHint")} />
        ) : (
          items.map((n) => (
            <Link
              key={n.id}
              href={n.link || "/dashboard"}
              className={`card card-interactive p-4 ${n.isRead ? "" : "card-unread"}`}
            >
              <div className="font-semibold">{n.title}</div>
              <div className="mt-1 text-sm text-[var(--color-muted-foreground)]">{n.body}</div>
              <div className="mt-2 text-xs text-[var(--color-muted-foreground)]">{timeAgo(n.createdAt, locale)}</div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
