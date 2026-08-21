"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES, DISTRICTS } from "@/lib/constants";
import { PageHeader } from "@/components/PageShell";

type Category = { id: string; name: string };

export default function MasterSetupPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [city, setCity] = useState("Душанбе");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [services, setServices] = useState("Насб, Таъмир");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setUserId(d.user?.id || "");
        if (d.user?.role !== "master") router.replace("/dashboard");
      });
  }, [router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/masters/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: form.get("displayName"),
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        city: form.get("city"),
        district: form.get("district"),
        categoryId: form.get("categoryId"),
        experience: Number(form.get("experience")),
        description: form.get("description"),
        priceFrom: Number(form.get("priceFrom")),
        workingHours: form.get("workingHours"),
        phone: form.get("phone"),
        services: String(form.get("services") || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    router.push("/dashboard/master");
  }

  return (
    <div className="page-wrap py-8">
      <PageHeader title="Профили усто" subtitle="Маълумоти касбии худро пур кунед" />
      <form onSubmit={onSubmit} className="card mx-auto max-w-2xl space-y-4 p-6 md:p-8">
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input" name="firstName" placeholder="Ном" />
          <input className="input" name="lastName" placeholder="Насаб" />
        </div>
        <input className="input" name="displayName" placeholder="Номи намоишӣ" />
        <input className="input" name="phone" placeholder="Телефон" />
        <div className="grid gap-3 sm:grid-cols-2">
          <select className="select" name="city" value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select className="select" name="district">
            <option value="">Ноҳия</option>
            {(DISTRICTS[city] || []).map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <select className="select" name="categoryId" required>
          <option value="">Категорияи асосӣ</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input className="input" name="services" value={services} onChange={(e) => setServices(e.target.value)} placeholder="Хизматрасониҳо (бо вергул)" />
        <input className="input" name="experience" type="number" placeholder="Таҷриба (сол)" required />
        <textarea className="textarea" name="description" placeholder="Тавсиф дар бораи худ" required />
        <input className="input" name="priceFrom" type="number" placeholder="Нарх аз ... сомонӣ" required />
        <input className="input" name="workingHours" placeholder="Соатҳои корӣ, масалан 08:00–20:00" />
        {error && <p className="alert-error" role="alert">{error}</p>}
        <button className="btn btn-primary w-full">Профилро захира кардан</button>
      </form>
    </div>
  );
}
