"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, StatusBadge } from "@/components/MasterCard";
import { formatSomoni } from "@/lib/utils";
import { IconClock, IconMapPin, IconStarFill, IconWallet, InlineCatIcon } from "@/components/icons";
import { CardTitle, PageLoading } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";

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

function CustomerActions({
  order,
  onStart,
  onComplete,
  onCancel,
  tr,
}: {
  order: Order;
  onStart: () => void;
  onComplete: () => void;
  onCancel: () => void;
  tr: (key: import("@/lib/i18n").TranslationKey) => string;
}) {
  const actions = [];

  if (order.status === "master_selected") {
    actions.push(
      <button key="start" className="btn btn-ghost flex-1 text-sm" onClick={onStart}>
        {tr("workStarted")}
      </button>,
    );
  }
  if (["master_selected", "in_progress"].includes(order.status)) {
    actions.push(
      <button key="complete" className="btn btn-primary flex-1 text-sm" onClick={onComplete}>
        {tr("workCompleted")}
      </button>,
    );
  }
  if (order.conversation) {
    actions.push(
      <Link key="chat" href={`/chat/${order.conversation.id}`} className="btn btn-accent flex-1 text-sm">
        {tr("chat")}
      </Link>,
    );
  }
  if (!["completed", "cancelled"].includes(order.status)) {
    actions.push(
      <button key="cancel" className="btn btn-ghost flex-1 text-sm text-rose-700" onClick={onCancel}>
        {tr("cancelOrder")}
      </button>,
    );
  }

  if (actions.length === 0) return null;

  return <div className="flex flex-wrap gap-2">{actions}</div>;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { tr } = useLocale();
  const [order, setOrder] = useState<Order | null>(null);
  const [me, setMe] = useState<{ id: string; role: string } | null>(null);
  const [error, setError] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);

  async function load() {
    const [o, u] = await Promise.all([
      fetch(`/api/orders/${id}`).then((r) => r.json()),
      fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)),
    ]);
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
    <div className="page-wrap py-4 sm:py-8">
      <div className="grid gap-4 lg:grid-cols-[1fr_300px] lg:gap-6">
        <div className="space-y-4 lg:space-y-6">
          <section className="card p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="font-display flex items-center gap-2 text-2xl font-bold sm:text-3xl">
                <InlineCatIcon icon={order.category?.icon} name={order.category?.name} /> {order.title}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
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
            <p className="mt-4 text-sm leading-7 sm:text-base">{order.description}</p>

            {isCustomer && (
              <div className="mt-4 border-t border-[var(--color-border)] pt-4 lg:hidden">
                <CustomerActions order={order} onStart={start} onComplete={complete} onCancel={cancel} tr={tr} />
              </div>
            )}

            {error && (
              <p className="alert-error mt-4" role="alert">
                {error}
              </p>
            )}
          </section>

          {isCustomer && (
            <section className="card p-4 sm:p-6">
              <CardTitle>{tr("offers")}</CardTitle>
              <div className="mt-4 space-y-3">
                {order.offers.map((o) => (
                  <div key={o.id} className="rounded-xl border border-[var(--color-border)] p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <Avatar name={`${o.master.firstName} ${o.master.lastName}`} src={o.master.avatar} size={48} />
                      <div className="min-w-0 flex-1">
                        <Link href={`/masters/${o.master.id}`} className="font-display text-lg font-bold">
                          {o.master.firstName} {o.master.lastName}
                        </Link>
                        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted-foreground)] sm:text-sm">
                          <span className="inline-flex items-center gap-1 text-[var(--color-star)]">
                            <IconStarFill size={14} /> {o.master.masterProfile?.ratingAverage?.toFixed(1) || "0.0"}
                          </span>
                          <span>{tr("ordersCount", { count: o.master.masterProfile?.completedOrders || 0 })}</span>
                          <span>{tr("yearsExperience", { count: o.master.masterProfile?.experience || 0 })}</span>
                        </p>
                        <p className="mt-2 font-bold text-[var(--color-accent)]">{o.price} сомонӣ</p>
                        <p className="mt-1 text-sm">{o.message}</p>
                        {o.arrivalTime && (
                          <p className="text-xs text-[var(--color-muted)] sm:text-sm">
                            {tr("arrivalTime")}: {o.arrivalTime}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={o.status} />
                    </div>
                    {["published", "receiving_offers"].includes(order.status) && o.status === "pending" && (
                      <button className="btn btn-primary mt-3 w-full text-sm" onClick={() => selectOffer(o.id)}>
                        {tr("selectThisMaster")}
                      </button>
                    )}
                  </div>
                ))}
                {order.offers.length === 0 && (
                  <p className="text-sm text-[var(--color-muted)]">{tr("noOffersYet")}</p>
                )}
              </div>
            </section>
          )}

          {(reviewOpen || (order.status === "completed" && isCustomer && !order.review)) && (
            <form onSubmit={sendReview} className="card space-y-3 p-4 sm:p-6">
              <CardTitle>{tr("ratingReview")}</CardTitle>
              <select className="select" name="rating" defaultValue="5">
                <option value="5">⭐⭐⭐⭐⭐ 5</option>
                <option value="4">⭐⭐⭐⭐ 4</option>
                <option value="3">⭐⭐⭐ 3</option>
                <option value="2">⭐⭐ 2</option>
                <option value="1">⭐ 1</option>
              </select>
              <textarea className="textarea" name="comment" placeholder={tr("yourComment")} required />
              <button className="btn btn-primary text-sm">{tr("submitReview")}</button>
            </form>
          )}
        </div>

        <aside className="hidden space-y-4 lg:block">
          {canOffer && (
            <form onSubmit={sendOffer} className="card space-y-3 p-4">
              <CardTitle>{tr("sendOfferTitle")}</CardTitle>
              <input className="input" name="price" type="number" placeholder={tr("myPrice")} required />
              <textarea className="textarea" name="message" placeholder={tr("offerNote")} required />
              <input className="input" name="arrivalTime" placeholder={tr("arrivalTime")} />
              <input className="input" name="finishTime" placeholder={tr("finishTime")} />
              <button className="btn btn-primary w-full text-sm">{tr("sendOffer")}</button>
            </form>
          )}

          {isCustomer && (
            <div className="card space-y-2 p-4">
              <CustomerActions order={order} onStart={start} onComplete={complete} onCancel={cancel} tr={tr} />
            </div>
          )}

          {me?.id === order.selectedMasterId && order.conversation && (
            <Link href={`/chat/${order.conversation.id}`} className="btn btn-primary w-full text-sm">
              {tr("chatWithCustomer")}
            </Link>
          )}
        </aside>

        {canOffer && (
          <form onSubmit={sendOffer} className="card space-y-3 p-4 lg:hidden">
            <CardTitle>{tr("sendOfferTitle")}</CardTitle>
            <input className="input" name="price" type="number" placeholder={tr("myPrice")} required />
            <textarea className="textarea" name="message" placeholder={tr("offerNote")} required />
            <div className="grid grid-cols-2 gap-2">
              <input className="input" name="arrivalTime" placeholder={tr("arrivalTime")} />
              <input className="input" name="finishTime" placeholder={tr("finishTime")} />
            </div>
            <button className="btn btn-primary w-full text-sm">{tr("sendOffer")}</button>
          </form>
        )}

        {me?.id === order.selectedMasterId && order.conversation && (
          <Link href={`/chat/${order.conversation.id}`} className="btn btn-primary w-full text-sm lg:hidden">
            {tr("chatWithCustomer")}
          </Link>
        )}
      </div>
    </div>
  );
}
