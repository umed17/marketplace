"use client";

import { FormEvent, useEffect, useState, type InputHTMLAttributes } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconUser, IconWrench } from "@/components/icons";
import { useLocale } from "@/components/LocaleProvider";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { mapSupabaseAuthError } from "@/lib/supabase/auth-errors";
import { EMAIL_OTP_LENGTH, OtpInput } from "@/components/OtpInput";

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

type RegisterStep = "form" | "verify";

type PendingRegister = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: "customer" | "master";
};

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { tr, locale } = useLocale();
  const next = useSearchParams().get("next") || "";
  const [role, setRole] = useState<"customer" | "master">("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registerStep, setRegisterStep] = useState<RegisterStep>("form");
  const [pending, setPending] = useState<PendingRegister | null>(null);
  const [otp, setOtp] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setTimeout(() => setResendSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendSeconds]);

  async function syncSessionAndRedirect() {
    const res = await fetch("/api/auth/sync", { method: "POST", credentials: "include" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || tr("genericError"));
      return false;
    }
    router.push(next || data.redirect || "/dashboard");
    router.refresh();
    return true;
  }

  async function onRegisterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!isSupabaseConfigured()) {
        setError(tr("supabaseNotConfigured"));
        return;
      }

      const form = new FormData(e.currentTarget);
      const payload: PendingRegister = {
        firstName: String(form.get("firstName") ?? ""),
        lastName: String(form.get("lastName") ?? ""),
        email: String(form.get("email") ?? "").trim().toLowerCase(),
        phone: String(form.get("phone") ?? ""),
        password: String(form.get("password") ?? ""),
        role,
      };
      const confirmPassword = String(form.get("confirmPassword") ?? "");

      if (payload.password !== confirmPassword) {
        setError(tr("passwordMismatch"));
        return;
      }

      const check = await fetch("/api/auth/register/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, confirmPassword }),
      });

      let checkData: { error?: string } = {};
      try {
        checkData = await check.json();
      } catch {
        setError(tr("networkError"));
        return;
      }

      if (!check.ok) {
        setError(checkData.error || tr("genericError"));
        return;
      }

      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            firstName: payload.firstName,
            lastName: payload.lastName,
            phone: payload.phone,
            role: payload.role,
          },
        },
      });

      if (signUpError) {
        setError(mapSupabaseAuthError(signUpError, locale));
        if (signUpError.code === "user_already_registered" || signUpError.code === "user_already_exists") {
          setPending(payload);
          setRegisterStep("verify");
          setResendSeconds(60);
        }
        return;
      }

      if (data.user?.identities?.length === 0) {
        setPending(payload);
        setRegisterStep("verify");
        setResendSeconds(60);
        return;
      }

      setPending(payload);
      setRegisterStep("verify");
      setResendSeconds(60);
    } catch {
      setError(tr("networkError"));
    } finally {
      setLoading(false);
    }
  }

  async function onVerifySubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pending) return;

    const code = otp.trim();
    if (code.length !== EMAIL_OTP_LENGTH) {
      setError(tr("emailCodePlaceholder"));
      return;
    }

    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: pending.email,
      token: code,
      type: "signup",
    });

    if (verifyError) {
      setLoading(false);
      setError(mapSupabaseAuthError(verifyError, locale));
      return;
    }

    const ok = await syncSessionAndRedirect();
    if (!ok) setLoading(false);
  }

  async function onResendCode() {
    if (!pending || resendSeconds > 0) return;

    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: pending.email,
    });

    setLoading(false);

    if (resendError) {
      setError(mapSupabaseAuthError(resendError, locale));
      return;
    }

    setResendSeconds(60);
  }

  async function onLoginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

        if (!signInError && data.user) {
          if (!data.user.email_confirmed_at) {
            setLoading(false);
            setError(tr("emailNotVerified"));
            return;
          }
          const ok = await syncSessionAndRedirect();
          if (!ok) setLoading(false);
          return;
        }
      } catch {
        // Fall back to legacy login for bcrypt users (e.g. admin seed).
      }
    }

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
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

  if (mode === "register" && registerStep === "verify" && pending) {
    return (
      <form onSubmit={onVerifySubmit} className="card mx-auto w-full max-w-lg space-y-4 p-5 sm:p-6 md:p-8">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{tr("checkEmailTitle")}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {tr("checkEmailSubtitle", { email: pending.email })}
          </p>
        </div>

        <OtpInput
          label={tr("emailCodeLabel")}
          value={otp}
          onChange={setOtp}
          disabled={loading}
        />

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert">
            {error}
          </p>
        )}

        <button className="btn btn-primary w-full" disabled={loading || otp.length !== EMAIL_OTP_LENGTH}>
          {loading ? tr("pleaseWait") : tr("verifyEmail")}
        </button>

        <button
          type="button"
          className="btn btn-ghost w-full"
          onClick={onResendCode}
          disabled={loading || resendSeconds > 0}
        >
          {resendSeconds > 0 ? tr("resendCodeWait", { seconds: resendSeconds }) : tr("resendCode")}
        </button>

        <button
          type="button"
          className="link mx-auto block text-sm"
          onClick={() => {
            setRegisterStep("form");
            setPending(null);
            setOtp("");
            setError("");
          }}
        >
          {tr("backToRegister")}
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={mode === "login" ? onLoginSubmit : onRegisterSubmit}
      className="card mx-auto w-full max-w-lg space-y-4 p-5 sm:p-6 md:p-8"
    >
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
