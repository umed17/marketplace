"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CITIES } from "@/lib/constants";
import { Empty, LoadingCards, MasterCard, type MasterCardData } from "@/components/MasterCard";
import { PageHeader } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";

type Category = { id: string; name: string; icon: string };

export default function MastersClient() {
  const { tr } = useLocale();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [categoryId, setCategoryId] = useState(params.get("categoryId") || "");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [sort, setSort] = useState("rating");
  const [verified, setVerified] = useState(false);
  const [online, setOnline] = useState(false);
  const [minRating, setMinRating] = useState("");
  const [minExperience, setMinExperience] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [masters, setMasters] = useState<MasterCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (categoryId) sp.set("categoryId", categoryId);
    if (city) sp.set("city", city);
    if (district) sp.set("district", district);
    if (sort) sp.set("sort", sort);
    if (verified) sp.set("verified", "1");
    if (online) sp.set("online", "1");
    if (minRating) sp.set("minRating", minRating);
    if (minExperience) sp.set("minExperience", minExperience);
    if (maxPrice) sp.set("maxPrice", maxPrice);
    return sp.toString();
  }, [q, categoryId, city, district, sort, verified, online, minRating, minExperience, maxPrice]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/masters?${query}`)
      .then((r) => r.json())
      .then((d) => setMasters(d.masters || []))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="page-wrap py-8">
      <PageHeader title={tr("findMasters")} subtitle={tr("mastersSubtitle")} />

      <div className="mt-5 space-y-3">
        <input
          className="input w-full"
          placeholder={tr("searchMasters")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label={tr("searchMasters")}
        />

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-8">
          <select className="select min-w-0" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label={tr("category")}>
            <option value="">{tr("allCategories")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
          <select className="select min-w-0" value={city} onChange={(e) => setCity(e.target.value)} aria-label={tr("city")}>
            <option value="">{tr("allCities")}</option>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input className="input min-w-0" placeholder={tr("district")} value={district} onChange={(e) => setDistrict(e.target.value)} />
          <input className="input min-w-0" type="number" placeholder={tr("ratingFrom")} value={minRating} onChange={(e) => setMinRating(e.target.value)} />
          <input className="input min-w-0" type="number" placeholder={tr("experienceFrom")} value={minExperience} onChange={(e) => setMinExperience(e.target.value)} />
          <input className="input min-w-0" type="number" placeholder={tr("priceUpTo")} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          <select className="select min-w-0" value={sort} onChange={(e) => setSort(e.target.value)} aria-label={tr("filters")}>
            <option value="rating">{tr("sortRating")}</option>
            <option value="newest">{tr("sortNewest")}</option>
            <option value="experience">{tr("sortExperience")}</option>
            <option value="price">{tr("sortPrice")}</option>
          </select>
          <label className="flex min-h-[2.75rem] cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-medium">
            <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="h-4 w-4 shrink-0 accent-[var(--color-primary)]" />
            <span className="truncate">{tr("verified")}</span>
          </label>
          <label className="flex min-h-[2.75rem] cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-medium">
            <input type="checkbox" checked={online} onChange={(e) => setOnline(e.target.checked)} className="h-4 w-4 shrink-0 accent-[var(--color-primary)]" />
            <span className="truncate">{tr("online")}</span>
          </label>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingCards count={4} />
        ) : masters.length === 0 ? (
          <Empty title={tr("masterNotFound")} text={tr("masterNotFoundHint")} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {masters.map((m) => (
              <MasterCard key={m.id} master={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
