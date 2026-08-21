"use client";

import { FormEvent, useEffect, useState } from "react";
import { CITIES } from "@/lib/constants";
import { CardTitle, PageHeader, PageLoading } from "@/components/PageShell";

export default function SettingsPage() {
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState<{ firstName: string; lastName: string; phone: string; city?: string; district?: string } | null>(
    null,
  );

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) =>
        setUser({
          firstName: d.user.firstName,
          lastName: d.user.lastName,
          phone: d.user.phone,
          city: d.user.customerProfile?.city || "",
          district: d.user.customerProfile?.district || "",
        }),
      );
  }, []);

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await res.json();
    setMsg(res.ok ? "Захира шуд" : data.error);
  }

  async function savePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: form.get("currentPassword"),
        newPassword: form.get("newPassword"),
      }),
    });
    const data = await res.json();
    setMsg(res.ok ? "Парол иваз шуд" : data.error);
  }

  if (!user) return <PageLoading />;

  return (
    <div className="page-wrap py-8">
      <PageHeader title="Settings" subtitle="Профил ва амният" />
      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={saveProfile} className="card space-y-3 p-6">
          <CardTitle>Профил</CardTitle>
          <input className="input" name="firstName" defaultValue={user.firstName} placeholder="Ном" />
          <input className="input" name="lastName" defaultValue={user.lastName} placeholder="Насаб" />
          <input className="input" name="phone" defaultValue={user.phone} placeholder="Телефон" />
          <select className="select" name="city" defaultValue={user.city}>
            <option value="">Шаҳр</option>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input className="input" name="district" defaultValue={user.district} placeholder="Ноҳия" />
          <button className="btn btn-primary">Захира кардан</button>
        </form>
        <form onSubmit={savePassword} className="card space-y-3 p-6">
          <CardTitle>Ивази парол</CardTitle>
          <input className="input" name="currentPassword" type="password" placeholder="Пароли ҷорӣ" required />
          <input className="input" name="newPassword" type="password" placeholder="Пароли нав" required minLength={8} />
          <button className="btn btn-ghost">Иваз кардан</button>
        </form>
      </div>
      {msg && <p className={`mt-4 ${msg.includes("Хато") || msg.includes("error") ? "alert-error" : "alert-success"}`}>{msg}</p>}
    </div>
  );
}
