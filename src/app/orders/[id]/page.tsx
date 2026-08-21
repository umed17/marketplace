"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, StatusBadge } from "@/components/MasterCard";
import { formatSomoni } from "@/lib/utils";
import { IconClock, IconMapPin, IconStarFill, IconWallet, InlineCatIcon } from "@/components/icons";
import { CardTitle, PageLoading } from "@/components/PageShell";

type Offer = {
  id: string;
  price: number;
  message: string;
  arrivalTime?: string;
  finishTime?: string;
  status: string;
  master: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
    masterProfile?: { ratingAverage?: number; completedOrders?: number; experience?: number };
  };
};

type Order = {
  id: string;
  title: string;
  description: string;
  city: string;
  district?: string;
  address?: string;
  budgetFrom?: number;
  budgetTo?: number;
  preferredTime?: string;
  priority: string;
  status: string;
  customerId: string;
  selectedMasterId?: string | null;
  customer: { id: string; firstName: string; lastName: string };
  category?: { name: string; icon?: string };
  offers: Offer[];
  conversation?: { id: string } | null;
  review?: { id: string } | null;
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [me, setMe] = useState<{ id: string; role: string } | null>(null);
  const [error, setError] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);

  async function load() {
    const [o, u] = await Promise.all([fetch(`/api/orders/${id}`).then((r) => r.json()), fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null))]);
    if (o.error) setError(o.error);
    else setOrder(o.order);
    setMe(u?.user ?? null);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function sendOffer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/orders/${id}/offers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: Number(form.get("price")),
        message: form.get("message"),
        arrivalTime: form.get("arrivalTime"),
        finishTime: form.get("finishTime"),
      }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    load();
    e.currentTarget.reset();
  }

  async function selectOffer(offerId: string) {
    const res = await fetch(`/api/orders/${id}/select`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    router.push(`/chat/${data.conversationId}`);
  }

  async function complete() {
    const res = await fetch(`/api/orders/${id}/complete`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setReviewOpen(true);
    load();
  }

  async function start() {
    await fetch(`/api/orders/${id}/start`, { method: "POST" });
    load();
  }

  async function cancel() {
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    load();
  }

  async function sendReview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: id,
        rating: Number(form.get("rating")),
        comment: form.get("comment"),
      }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setReviewOpen(false);
    load();
  }

  if (!order) return <PageLoading message={error || "Боргирӣ..."} />;
  const isCustomer = me?.id === order.customerId;
  const isMaster = me?.role === "master";
  const canOffer = isMaster && ["published", "receiving_offers"].includes(order.status);

  return (
    <div className="page-wrap grid gap-6 py-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-display flex items-center gap-2 text-3xl font-bold">
              <InlineCatIcon icon={order.category?.icon} name={order.category?.name} /> {order.title}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-[var(--color-muted-foreground)]">
            <span className="inline-flex items-center gap-1">
              <IconMapPin size={15} /> {order.city}
              {order.district ? `, ${order.district}` : ""} {order.address ? `· ${order.address}` : ""}
            </span>
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1">
              <IconWallet size={15} /> {formatSomoni(order.budgetFrom)}–{formatSomoni(order.budgetTo)}
            </span>
            <span className="inline-flex items-center gap-1 text-[var(--color-muted-foreground)]">
              <IconClock size={15} /> {order.preferredTime || "—"}
            </span>
          </p>
          <p className="mt-4 leading-7">{order.description}</p>
          {error && <p className="alert-error mt-4" role="alert">{error}</p>}
        </section>

        {isCustomer && (
          <section className="card p-6">
            <CardTitle>Пешниҳодҳо</CardTitle>
            <div className="mt-4 space-y-4">
              {order.offers.map((o) => (
                <div key={o.id} className="rounded-xl border border-[var(--color-border)] p-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={`${o.master.firstName} ${o.master.lastName}`} src={o.master.avatar} />
                    <div className="flex-1">
                      <Link href={`/masters/${o.master.id}`} className="font-display text-xl font-bold">
                        {o.master.firstName} {o.master.lastName}
                      </Link>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                        <span className="inline-flex items-center gap-1 text-[var(--color-star)]">
                          <IconStarFill size={14} /> {o.master.masterProfile?.ratingAverage?.toFixed(1) || "0.0"}
                        </span>
                        <span>{o.master.masterProfile?.completedOrders || 0} заказ</span>
                        <span>{o.master.masterProfile?.experience || 0} сол таҷриба</span>
                      </p>
                      <p className="mt-2 font-bold text-[var(--color-accent)]">{o.price} сомонӣ</p>
                      <p className="mt-1">{o.message}</p>
                      {o.arrivalTime && <p className="text-sm text-[var(--color-muted)]">Расидан: {o.arrivalTime}</p>}
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                  {["published", "receiving_offers"].includes(order.status) && o.status === "pending" && (
                    <button className="btn btn-primary mt-3 w-full" onClick={() => selectOffer(o.id)}>
                      Ин усторо интихоб кардан
                    </button>
                  )}
                </div>
              ))}
              {order.offers.length === 0 && <p className="text-sm text-[var(--color-muted)]">Ҳанӯз пешниҳод нест.</p>}
            </div>
          </section>
        )}

        {(reviewOpen || (order.status === "completed" && isCustomer && !order.review)) && (
          <form onSubmit={sendReview} className="card space-y-3 p-6">
            <CardTitle>Рейтинг ва отзыв</CardTitle>
            <select className="select" name="rating" defaultValue="5">
              <option value="5">⭐⭐⭐⭐⭐ 5</option>
              <option value="4">⭐⭐⭐⭐ 4</option>
              <option value="3">⭐⭐⭐ 3</option>
              <option value="2">⭐⭐ 2</option>
              <option value="1">⭐ 1</option>
            </select>
            <textarea className="textarea" name="comment" placeholder="Шарҳи шумо..." required />
            <button className="btn btn-primary">Отзыв гузоштан</button>
          </form>
        )}
      </div>

      <aside className="space-y-4">
        {canOffer && (
          <form onSubmit={sendOffer} className="card space-y-3 p-5">
            <CardTitle>Пешниҳод фиристодан</CardTitle>
            <input className="input" name="price" type="number" placeholder="Нархи ман (сомонӣ)" required />
            <textarea className="textarea" name="message" placeholder="Тавзеҳ" required />
            <input className="input" name="arrivalTime" placeholder="Вақти расидан" />
            <input className="input" name="finishTime" placeholder="Вақти анҷоми кор" />
            <button className="btn btn-primary w-full">Пешниҳод фиристодан</button>
          </form>
        )}

        {isCustomer && (
          <div className="card space-y-2 p-5">
            {order.status === "master_selected" && (
              <button className="btn btn-ghost w-full" onClick={start}>
                Кор оғоз шуд
              </button>
            )}
            {["master_selected", "in_progress"].includes(order.status) && (
              <button className="btn btn-primary w-full" onClick={complete}>
                Кор анҷом шуд
              </button>
            )}
            {order.conversation && (
              <Link href={`/chat/${order.conversation.id}`} className="btn btn-accent w-full">
                Chat
              </Link>
            )}
            {!["completed", "cancelled"].includes(order.status) && (
              <button className="btn btn-ghost w-full" onClick={cancel}>
                Бекор кардан
              </button>
            )}
          </div>
        )}

        {me?.id === order.selectedMasterId && order.conversation && (
          <Link href={`/chat/${order.conversation.id}`} className="btn btn-primary w-full">
            Chat бо муштарӣ
          </Link>
        )}
      </aside>
    </div>
  );
}
