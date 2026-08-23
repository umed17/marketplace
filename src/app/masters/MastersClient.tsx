"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CITIES } from "@/lib/constants";
import { Empty, LoadingCards, MasterCard, type MasterCardData } from "@/components/MasterCard";
import { IconClose } from "@/components/icons";
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
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  const filters = (
    <div className="space-y-3">
      <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label={tr("category")}>
        <option value="">{tr("allCategories")}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.icon} {c.name}
          </option>
        ))}
      </select>
      <select className="select" value={city} onChange={(e) => setCity(e.target.value)} aria-label={tr("city")}>
        <option value="">{tr("allCities")}</option>
        {CITIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <input className="input" placeholder={tr("district")} value={district} onChange={(e) => setDistrict(e.target.value)} />
      <input className="input" type="number" placeholder={tr("ratingFrom")} value={minRating} onChange={(e) => setMinRating(e.target.value)} />
      <input className="input" type="number" placeholder={tr("experienceFrom")} value={minExperience} onChange={(e) => setMinExperience(e.target.value)} />
      <input className="input" type="number" placeholder={tr("priceUpTo")} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
        {tr("verified")}
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={online} onChange={(e) => setOnline(e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
        {tr("online")}
      </label>
      <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label={tr("filters")}>
        <option value="rating">{tr("sortRating")}</option>
        <option value="newest">{tr("sortNewest")}</option>
        <option value="experience">{tr("sortExperience")}</option>
        <option value="price">{tr("sortPrice")}</option>
      </select>
    </div>
  );

  return (
    <div className="page-wrap py-8">
      <PageHeader title={tr("findMasters")} subtitle={tr("mastersSubtitle")} />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          className="input"
          placeholder={tr("searchMasters")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label={tr("searchMasters")}
        />
        <button className="btn btn-ghost shrink-0 md:hidden" onClick={() => setFiltersOpen(true)}>
          {tr("filters")}
        </button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr]">
        <aside className="card hidden h-fit p-4 md:block">
          <h2 className="mb-3 font-display text-lg font-bold">{tr("filters")}</h2>
          {filters}
        </aside>
        <div>
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

      {filtersOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setFiltersOpen(false)} role="presentation">
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-auto rounded-t-2xl border-t border-[var(--color-border)] bg-white p-5"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filters-title"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 id="filters-title" className="font-display text-2xl font-bold">
                {tr("filters")}
              </h2>
              <button className="btn btn-ghost px-2.5 py-2" onClick={() => setFiltersOpen(false)} aria-label={tr("closeMenu")}>
                <IconClose size={20} />
              </button>
            </div>
            {filters}
            <button className="btn btn-primary mt-4 w-full" onClick={() => setFiltersOpen(false)}>
              {tr("showResults")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
