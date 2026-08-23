"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

export function Footer() {
  const { tr } = useLocale();

  return (
    <footer className="mt-8 border-t border-[var(--color-border)] bg-white py-5 text-sm text-[var(--color-muted-foreground)] md:mt-16 md:py-10">
      <div className="page-wrap grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="font-display text-xl font-bold text-[var(--color-primary)]">{tr("brandName")}</div>
          <p className="mt-2 max-w-sm leading-relaxed">{tr("footerDesc")}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">{tr("footerMvp")}</p>
        </div>

        <div className="hidden md:block">
          <h3 className="font-display text-sm font-bold text-[var(--color-foreground)]">{tr("footerNav")}</h3>
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/masters" className="link w-fit">
              {tr("mastersShort")}
            </Link>
            <Link href="/orders" className="link w-fit">
              {tr("orders")}
            </Link>
            <Link href="/categories" className="link w-fit">
              {tr("categories")}
            </Link>
            <Link href="/how-it-works" className="link w-fit">
              {tr("howItWorks")}
            </Link>
          </div>
        </div>

        <div className="hidden md:block">
          <h3 className="font-display text-sm font-bold text-[var(--color-foreground)]">{tr("footerStart")}</h3>
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/create-order" className="link w-fit">
              {tr("createOrder")}
            </Link>
            <Link href="/register" className="link w-fit">
              {tr("register")}
            </Link>
            <Link href="/login" className="link w-fit">
              {tr("login")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
