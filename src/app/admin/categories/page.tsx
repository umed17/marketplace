"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

type Cat = { id: string; name: string; slug: string; icon: string; isActive: boolean };

export default function AdminCategories() {
  const { tr } = useLocale();
  const [cats, setCats] = useState<Cat[]>([]);
  async function load() {
    const d = await fetch("/api/admin/categories").then((r) => r.json());
    setCats(d.categories || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        slug: String(form.get("slug") || "").toLowerCase(),
        icon: form.get("icon") || "🔧",
      }),
    });
    e.currentTarget.reset();
    load();
  }

  async function remove(id: string) {
    if (!confirm(tr("confirmDelete"))) return;
    await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={create} className="card space-y-3 p-5">
        <h2 className="font-display text-2xl font-bold">{tr("newCategory")}</h2>
        <input className="input" name="name" placeholder={tr("categoryName")} required />
        <input className="input" name="slug" placeholder={tr("slug")} required />
        <input className="input" name="icon" placeholder={tr("iconEmoji")} />
        <button className="btn btn-primary">{tr("create")}</button>
      </form>
      <div className="grid gap-2">
        {cats.map((c) => (
          <div key={c.id} className="card flex items-center justify-between p-3">
            <span>
              {c.icon} {c.name}
            </span>
            <button className="btn btn-ghost text-sm" onClick={() => remove(c.id)}>
              {tr("delete")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
