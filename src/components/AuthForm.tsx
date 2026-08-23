"use client";

import { FormEvent, useState, type InputHTMLAttributes } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconUser, IconWrench } from "@/components/icons";
import { useLocale } from "@/components/LocaleProvider";

function Field({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input className="input" {...props} />
    </label>
  );
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { tr } = useLocale();
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
      setError(data.error || tr("genericError"));
      return;
    }
    router.push(next || data.redirect || "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto w-full max-w-lg space-y-4 p-5 sm:p-6 md:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{mode === "login" ? tr("login") : tr("register")}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {mode === "login" ? tr("authLoginSubtitle") : tr("authRegisterSubtitle")}
        </p>
      </div>

      {mode === "register" && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole("master")}
            className={`btn text-xs sm:text-sm ${role === "master" ? "btn-primary" : "btn-ghost"}`}
          >
            <IconWrench size={16} />
            <span className="leading-tight">{tr("iAmMaster")}</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`btn text-xs sm:text-sm ${role === "customer" ? "btn-primary" : "btn-ghost"}`}
          >
            <IconUser size={16} />
            <span className="leading-tight">{tr("iAmCustomer")}</span>
          </button>
        </div>
      )}

      {mode === "register" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={tr("firstName")} name="firstName" required autoComplete="given-name" />
          <Field label={tr("lastName")} name="lastName" required autoComplete="family-name" />
        </div>
      )}

      <Field label="Email" name="email" type="email" placeholder="email@example.com" required autoComplete="email" />

      {mode === "register" && (
        <Field label={tr("phone")} name="phone" type="tel" placeholder="+992900000000" required autoComplete="tel" />
      )}

      <Field
        label={tr("password")}
        name="password"
        type="password"
        placeholder={mode === "register" ? tr("passwordHint") : tr("passwordPlaceholder")}
        required
        minLength={mode === "register" ? 8 : 1}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
      />

      {mode === "register" && (
        <Field
          label={tr("confirmPassword")}
          name="confirmPassword"
          type="password"
          placeholder={tr("repeatPassword")}
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
        {loading ? tr("pleaseWait") : mode === "login" ? tr("login") : tr("createAccount")}
      </button>

      <p className="text-center text-sm text-[var(--color-muted-foreground)]">
        {mode === "login" ? (
          <>
            {tr("noAccount")}{" "}
            <Link href="/register" className="link">
              {tr("register")}
            </Link>
          </>
        ) : (
          <>
            {tr("haveAccount")}{" "}
            <Link href="/login" className="link">
              {tr("login")}
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
