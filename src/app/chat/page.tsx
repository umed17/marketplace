"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, Empty } from "@/components/MasterCard";
import { timeAgo, isOnline } from "@/lib/utils";
import { PageHeader } from "@/components/PageShell";

type Item = {
  id: string;
  unread: number;
  updatedAt: string;
  order: { title: string };
  other: { firstName: string; lastName: string; avatar?: string | null; lastSeenAt?: string | null };
  lastMessage?: { body: string; createdAt: string } | null;
};

export default function ChatListPage() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => setItems(d.conversations || []));
    const t = setInterval(() => {
      fetch("/api/conversations")
        .then((r) => r.json())
        .then((d) => setItems(d.conversations || []));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="page-wrap py-8">
      <PageHeader title="Chat" subtitle="Муошират бо усто ё муштарӣ" />
      <div className="grid gap-3">
        {items.length === 0 ? (
          <Empty title="Chat нест" text="Пас аз интихоби усто chat кушода мешавад." />
        ) : (
          items.map((c) => {
            const name = `${c.other.firstName} ${c.other.lastName}`;
            return (
              <Link key={c.id} href={`/chat/${c.id}`} className="card card-interactive flex items-center gap-4 p-4">
                <Avatar name={name} src={c.other.avatar} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold">
                      {name}{" "}
                      {isOnline(c.other.lastSeenAt) && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                          Online
                        </span>
                      )}
                    </div>
                    <div className="shrink-0 text-xs text-[var(--color-muted-foreground)]">
                      {timeAgo(c.lastMessage?.createdAt || c.updatedAt)}
                    </div>
                  </div>
                  <div className="truncate text-sm text-[var(--color-muted-foreground)]">
                    {c.lastMessage?.body || c.order.title}
                  </div>
                </div>
                {c.unread > 0 && (
                  <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[var(--color-accent)] px-2 text-xs font-bold text-white">
                    {c.unread > 9 ? "9+" : c.unread}
                  </span>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
