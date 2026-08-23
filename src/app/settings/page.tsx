"use client";

import { FormEvent, useEffect, useState } from "react";
import { CITIES } from "@/lib/constants";
import { CardTitle, PageHeader, PageLoading } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";

export default function SettingsPage() {
  const { tr } = useLocale();
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
    setMsg(res.ok ? tr("saved") : data.error);
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
    setMsg(res.ok ? tr("passwordChanged") : data.error);
  }

  if (!user) return <PageLoading />;

  return (
    <div className="page-wrap py-8">
      <PageHeader title={tr("settings")} subtitle={tr("settingsSubtitle")} />
      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={saveProfile} className="card space-y-3 p-6">
          <CardTitle>{tr("profile")}</CardTitle>
          <input className="input" name="firstName" defaultValue={user.firstName} placeholder={tr("firstName")} />
          <input className="input" name="lastName" defaultValue={user.lastName} placeholder={tr("lastName")} />
          <input className="input" name="phone" defaultValue={user.phone} placeholder={tr("phone")} />
          <select className="select" name="city" defaultValue={user.city}>
            <option value="">{tr("city")}</option>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input className="input" name="district" defaultValue={user.district} placeholder={tr("district")} />
          <button className="btn btn-primary">{tr("save")}</button>
        </form>
        <form onSubmit={savePassword} className="card space-y-3 p-6">
          <CardTitle>{tr("changePassword")}</CardTitle>
          <input className="input" name="currentPassword" type="password" placeholder={tr("currentPassword")} required />
          <input className="input" name="newPassword" type="password" placeholder={tr("newPassword")} required minLength={8} />
          <button className="btn btn-ghost">{tr("changePassword")}</button>
        </form>
      </div>
      {msg && <p className={`mt-4 ${msg.includes("Хато") || msg.includes("error") || msg.includes("нодуруст") ? "alert-error" : "alert-success"}`}>{msg}</p>}
    </div>
  );
}
