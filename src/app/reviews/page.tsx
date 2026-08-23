"use client";

import { useEffect, useState } from "react";
import { Empty } from "@/components/MasterCard";
import { IconStarFill } from "@/components/icons";
import { PageHeader } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  order?: { title: string };
  master?: { firstName: string; lastName: string };
  customer?: { firstName: string; lastName: string };
};

export default function ReviewsPage() {
  const { tr } = useLocale();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [role, setRole] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(async (r) => {
      const d = await r.json();
      setRole(d.user?.role);
      const id = d.user?.id;
      if (d.user?.role === "master") {
        const res = await fetch(`/api/reviews?masterId=${id}`).then((x) => x.json());
        setReviews(res.reviews || []);
      } else {
        const orders = await fetch("/api/orders?scope=mine").then((x) => x.json());
        const withReview = (orders.orders || []).filter((o: { review?: unknown }) => o.review);
        setReviews(
          withReview.map(
            (o: {
              id: string;
              title: string;
              review: Review;
              selectedMaster?: { firstName: string; lastName: string };
            }) => ({
              ...o.review,
              order: { title: o.title },
              master: o.selectedMaster,
            }),
          ),
        );
      }
    });
  }, []);

  return (
    <div className="page-wrap py-8">
      <PageHeader
        title={tr("reviewsSection")}
        subtitle={role === "master" ? tr("reviewsMasterSubtitle") : tr("reviewsCustomerSubtitle")}
      />
      <div className="grid gap-3">
        {reviews.length === 0 ? (
          <Empty
            title="Отзыв нест"
            text={role === "master" ? "Пас аз анҷоми кор отзывҳо ин ҷо меоянд." : "Баъди анҷоми заказ отзыв гузоред."}
          />
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="inline-flex items-center gap-1 font-semibold text-[var(--color-star)]">
                <IconStarFill size={16} aria-hidden="true" />
                {r.rating.toFixed(1)} / 5
              </div>
              <p className="mt-2 leading-relaxed">{r.comment}</p>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{r.order?.title}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
