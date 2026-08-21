"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { useLocale } from "@/components/LocaleProvider";

type Order = {
  id: string;
  title: string;
  status: string;
  city: string;
  customer: { firstName: string; lastName: string };
};

export default function AdminOrders() {
  const { tr } = useLocale();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("");
  useEffect(() => {
    const q = status ? `?status=${status}` : "";
    fetch(`/api/admin/orders${q}`)
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []));
  }, [status]);
  return (
    <div>
      <select className="select mb-4 max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">{tr("all")}</option>
        <option value="receiving_offers">{tr("filterActiveOrders")}</option>
        <option value="in_progress">{tr("filterInProgress")}</option>
        <option value="completed">{tr("filterCompleted")}</option>
        <option value="cancelled">{tr("filterCancelled")}</option>
      </select>
      <div className="grid gap-3">
        {orders.map((o) => (
          <a key={o.id} href={`/orders/${o.id}`} className="card flex items-center justify-between p-4">
            <div>
              <div className="font-bold">{o.title}</div>
              <div className="text-sm">
                {o.customer.firstName} {o.customer.lastName} · {o.city}
              </div>
            </div>
            <StatusBadge status={o.status} />
          </a>
        ))}
      </div>
    </div>
  );
}
