"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES, DISTRICTS } from "@/lib/constants";
import { PageHeader } from "@/components/PageShell";

type Category = { id: string; name: string };
type PriceType = "fixed" | "negotiable";

export default function MasterSetupPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [city, setCity] = useState("Душанбе");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [priceType, setPriceType] = useState<PriceType>("fixed");
  const [priceFrom, setPriceFrom] = useState("");

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

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/masters/${userId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const master = d?.master;
        if (!master) return;
        if (master.priceFrom == null) {
          setPriceType("negotiable");
          setPriceFrom("");
        } else {
          setPriceType("fixed");
          setPriceFrom(String(master.priceFrom));
        }
      });
  }, [userId]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const priceNegotiable = priceType === "negotiable";
    const res = await fetch(`/api/masters/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city: form.get("city"),
        district: form.get("district"),
        categoryId: form.get("categoryId"),
        experience: Number(form.get("experience")),
        description: form.get("description"),
        priceNegotiable,
        priceFrom: priceNegotiable ? null : Number(priceFrom || form.get("priceFrom")),
        workingHours: form.get("workingHours"),
        phone: form.get("phone"),
      }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    router.push("/dashboard/master/orders");
  }

  return (
    <div className="page-wrap py-8">
      <PageHeader title="Профили усто" subtitle="Маълумоти касбии худро пур кунед" />
      <form onSubmit={onSubmit} className="card mx-auto max-w-2xl space-y-4 p-6 md:p-8">
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
        <input className="input" name="experience" type="number" placeholder="Таҷриба (сол)" required />
        <textarea className="textarea" name="description" placeholder="Тавсиф дар бораи худ" required />

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-[var(--color-ink)]">Нархи хизмат</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                priceType === "fixed"
                  ? "border-[var(--color-primary)] bg-[var(--color-muted-bg)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-secondary)]"
              }`}
            >
              <span className="flex items-start gap-3">
                <input
                  type="radio"
                  name="priceType"
                  value="fixed"
                  checked={priceType === "fixed"}
                  onChange={() => setPriceType("fixed")}
                  className="mt-1"
                />
                <span>
                  <span className="block font-semibold">Дар сомонӣ</span>
                  <span className="mt-1 block text-sm text-[var(--color-muted-foreground)]">
                    Нархи корро бо сомонӣ нависед, мисли дигар платформаҳо
                  </span>
                </span>
              </span>
            </label>

            <label
              className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                priceType === "negotiable"
                  ? "border-[var(--color-primary)] bg-[var(--color-muted-bg)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-secondary)]"
              }`}
            >
              <span className="flex items-start gap-3">
                <input
                  type="radio"
                  name="priceType"
                  value="negotiable"
                  checked={priceType === "negotiable"}
                  onChange={() => setPriceType("negotiable")}
                  className="mt-1"
                />
                <span>
                  <span className="block font-semibold">Шартномavӣ</span>
                  <span className="mt-1 block text-sm text-[var(--color-muted-foreground)]">
                    Нарх бо муштарӣ баъд аз мубоҳиса муайян мешавад
                  </span>
                </span>
              </span>
            </label>
          </div>

          {priceType === "fixed" && (
            <div className="flex items-center gap-2">
              <input
                className="input flex-1"
                name="priceFrom"
                type="number"
                min={0}
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
                placeholder="Масалан: 150"
                required
              />
              <span className="shrink-0 text-sm font-semibold text-[var(--color-muted-foreground)]">сомонӣ</span>
            </div>
          )}
        </fieldset>

        <input className="input" name="workingHours" placeholder="Соатҳои корӣ, масалан 08:00–20:00" />
        {error && (
          <p className="alert-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn-primary w-full">Профилро захира кардан</button>
      </form>
    </div>
  );
}
