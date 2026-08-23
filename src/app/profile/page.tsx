"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/MasterCard";
import { IconClose } from "@/components/icons";
import { CardTitle, PageHeader, PageLoading } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string | null;
  masterProfile?: {
    id: string;
    displayName?: string;
    city?: string;
    description?: string;
    portfolio?: { id: string; imageUrl: string; description?: string }[];
  } | null;
};

export default function ProfilePage() {
  const { tr } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [desc, setDesc] = useState("");

  async function load() {
    const d = await fetch("/api/auth/me").then((r) => r.json());
    setUser(d.user);
  }
  useEffect(() => {
    load();
  }, []);

  async function uploadAvatar(file: File) {
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", "avatars");
    const up = await fetch("/api/upload", { method: "POST", body: fd }).then((r) => r.json());
    if (up.url) {
      await fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: up.url, firstName: user?.firstName, lastName: user?.lastName }),
      });
      load();
    }
  }

  async function addPortfolio(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const file = (form.elements.namedItem("file") as HTMLInputElement).files?.[0];
    let imageUrl = "";
    if (file) {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", "portfolio");
      const up = await fetch("/api/upload", { method: "POST", body: fd }).then((r) => r.json());
      imageUrl = up.url || "";
    }
    await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, description: desc }),
    });
    setDesc("");
    form.reset();
    load();
  }

  if (!user) return <PageLoading />;
  const name = `${user.firstName} ${user.lastName}`;

  return (
    <div className="page-wrap space-y-6 py-8">
      <PageHeader title={tr("profile")} subtitle="Маълумоти шахсӣ ва корҳои анҷомшуда" />
      <section className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar name={name} src={user.avatar} size={80} />
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold">{name}</h2>
            <p className="text-[var(--color-muted-foreground)]">
              {user.role === "master" ? "Усто" : user.role === "admin" ? "Админ" : "Муштарӣ"} · {user.email} · {user.phone}
            </p>
          </div>
          <label className="btn btn-ghost cursor-pointer">
            Сурат илова кардан
            <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
          </label>
        </div>
        {user.role === "master" && (
          <Link href="/profile/setup" className="btn btn-primary mt-4">
            Профилро таҳрир кардан
          </Link>
        )}
        {user.role === "customer" && (
          <Link href="/settings" className="btn btn-primary mt-4">
            Профилро таҳрир кардан
          </Link>
        )}
      </section>

      {user.role === "master" && (
        <section className="card p-6">
          <CardTitle>{tr("portfolio")}</CardTitle>
          <form onSubmit={addPortfolio} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input className="input" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Тавсифи кор" />
            <input className="input" type="file" name="file" accept="image/*" />
            <button className="btn btn-primary sm:col-span-2">Илова кардан</button>
          </form>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {user.masterProfile?.portfolio?.map((p) => (
              <div key={p.id} className="media-card">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt="" className="h-36 w-full object-cover" />
                ) : (
                  <div className="media-card-placeholder h-36">Сурат нест</div>
                )}
                <div className="flex items-center justify-between p-3 text-sm">
                  <span>{p.description}</span>
                  <button
                    className="btn btn-ghost px-2 py-1 text-rose-700"
                    aria-label="Нест кардан"
                    onClick={async () => {
                      await fetch(`/api/portfolio?id=${p.id}`, { method: "DELETE" });
                      load();
                    }}
                  >
                    <IconClose size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
