"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconUser, IconWrench } from "@/components/icons";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const next = useSearchParams().get("next") || "";
  const [role, setRole] = useState<"customer" | "master">("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload =
      mode === "login"
        ? { email: form.get("email"), password: form.get("password") }
        : {
            firstName: form.get("firstName"),
            lastName: form.get("lastName"),
            email: form.get("email"),
            phone: form.get("phone"),
            password: form.get("password"),
            confirmPassword: form.get("confirmPassword"),
            role,
          };

    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Хато рӯй дод");
      return;
    }
    router.push(next || data.redirect || "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto w-full max-w-lg space-y-4 p-6 md:p-8">
      <div>
        <h1 className="font-display text-3xl font-bold">{mode === "login" ? "Ворид шудан" : "Регистрация"}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {mode === "login" ? "Ба ҳисоби худ ворид шавед" : "Ҳисоби нав созед — ройгон"}
        </p>
      </div>

      {mode === "register" && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole("master")}
            className={`btn text-sm ${role === "master" ? "btn-primary" : "btn-ghost"}`}
          >
            <IconWrench size={16} />
            Ман усто ҳастам
          </button>
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`btn text-sm ${role === "customer" ? "btn-primary" : "btn-ghost"}`}
          >
            <IconUser size={16} />
            Ман муштарӣ ҳастам
          </button>
        </div>
      )}

      {mode === "register" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input" name="firstName" placeholder="Ном" required autoComplete="given-name" />
          <input className="input" name="lastName" placeholder="Насаб" required autoComplete="family-name" />
        </div>
      )}
      <input className="input" name="email" type="email" placeholder="Email" required autoComplete="email" />
      {mode === "register" && (
        <input className="input" name="phone" placeholder="Рақами телефон" required autoComplete="tel" />
      )}
      <input
        className="input"
        name="password"
        type="password"
        placeholder="Парол"
        required
        minLength={mode === "register" ? 8 : 1}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
      />
      {mode === "register" && (
        <input
          className="input"
          name="confirmPassword"
          type="password"
          placeholder="Тасдиқи парол"
          required
          autoComplete="new-password"
        />
      )}

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert">
          {error}
        </p>
      )}

      <button className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Интизор шавед..." : mode === "login" ? "Ворид шудан" : "Ҳисоб сохтан"}
      </button>

      <p className="text-center text-sm text-[var(--color-muted-foreground)]">
        {mode === "login" ? (
          <>
            Ҳисоб надоред?{" "}
            <Link href="/register" className="link">
              Регистрация
            </Link>
          </>
        ) : (
          <>
            Аллакай ҳисоб доред?{" "}
            <Link href="/login" className="link">
              Ворид шавед
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
