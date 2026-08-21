"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CITIES, DISTRICTS } from "@/lib/constants";
import { PageHeader } from "@/components/PageShell";

type Category = { id: string; name: string };

export default function CreateOrderPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [city, setCity] = useState("Душанбе");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = {
      title: form.get("title"),
      categoryId: form.get("categoryId"),
      description: form.get("description"),
      city: form.get("city"),
      district: form.get("district"),
      address: form.get("address"),
      budgetFrom: form.get("budgetFrom") ? Number(form.get("budgetFrom")) : undefined,
      budgetTo: form.get("budgetTo") ? Number(form.get("budgetTo")) : undefined,
      preferredTime: form.get("preferredTime"),
      priority: form.get("priority"),
      masterId: sp.get("masterId") || undefined,
    };
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Хато");
      return;
    }

    if (files.length && data.order?.id) {
      for (const file of files) {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("folder", "orders");
        const up = await fetch("/api/upload", { method: "POST", body: fd }).then((r) => r.json());
        if (up.url) {
          await fetch(`/api/orders/${data.order.id}/media`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: up.url, type: file.type.startsWith("video") ? "video" : "image" }),
          });
        }
      }
    }

    router.push(data.conversationId ? `/chat/${data.conversationId}` : `/orders/${data.order.id}`);
  }

  const districts = DISTRICTS[city] || [];

  return (
    <div className="page-wrap py-8">
      <PageHeader title="Заказ гузоштан" subtitle="Маълумотро пур кунед — устоҳо пешниҳод мефиристанд" />
      <form onSubmit={onSubmit} className="card mx-auto max-w-2xl space-y-4 p-6 md:p-8">
        {sp.get("masterId") && (
          <p className="alert-info">Ин заказ мустақим ба устои интихобшуда меравад ва chat кушода мешавад.</p>
        )}
        <input className="input" name="title" placeholder="Номи заказ" required />
        <select className="select" name="categoryId" defaultValue={sp.get("categoryId") || ""} required>
          <option value="">Категория</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <textarea className="textarea" name="description" placeholder="Тавсифи кор" required />
        <div className="grid gap-3 sm:grid-cols-2">
          <select className="select" name="city" value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select className="select" name="district">
            <option value="">Ноҳия</option>
            {districts.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <input className="input" name="address" placeholder="Адрес/ҷой" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input" name="budgetFrom" type="number" placeholder="Буҷет аз" />
          <input className="input" name="budgetTo" type="number" placeholder="Буҷет то" />
        </div>
        <input className="input" name="preferredTime" placeholder="Вақти лозим (масалан Имрӯз 18:00)" />
        <select className="select" name="priority" defaultValue="normal">
          <option value="low">Priority: Паст</option>
          <option value="normal">Priority: Муқаррарӣ</option>
          <option value="high">Priority: Баланд</option>
        </select>
        <input className="input" type="file" multiple accept="image/*,video/mp4,video/webm" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
        {error && <p className="alert-error" role="alert">{error}</p>}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Нашр..." : "Заказро нашр кардан"}
        </button>
      </form>
    </div>
  );
}
