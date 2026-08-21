"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { statusLabel } from "@/lib/i18n";

type Review = {
  id: string;
  rating: number;
  comment: string;
  status: string;
  customer: { firstName: string };
  master: { firstName: string };
};

export default function AdminReviews() {
  const { tr, locale } = useLocale();
  const [reviews, setReviews] = useState<Review[]>([]);
  async function load() {
    const d = await fetch("/api/admin/reviews").then((r) => r.json());
    setReviews(d.reviews || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function hide(id: string) {
    await fetch("/api/admin/reviews", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "hidden" }),
    });
    load();
  }
  async function remove(id: string) {
    if (!confirm(tr("confirmDelete"))) return;
    await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="grid gap-3">
      {reviews.map((r) => (
        <div key={r.id} className="card p-4">
          <div className="font-bold">
            {"⭐".repeat(r.rating)} {r.customer.firstName} → {r.master.firstName} ({statusLabel(locale, r.status)})
          </div>
          <p className="mt-1">{r.comment}</p>
          <div className="mt-2 flex gap-2">
            <button className="btn btn-ghost text-sm" onClick={() => hide(r.id)}>
              {tr("hide")}
            </button>
            <button className="btn btn-ghost text-sm" onClick={() => remove(r.id)}>
              {tr("delete")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
