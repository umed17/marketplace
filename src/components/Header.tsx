"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IconBell, IconClose, IconLogin, IconLogout, IconMenu, IconUserPlus } from "@/components/icons";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/components/LocaleProvider";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  role: "customer" | "master" | "admin";
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { tr } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.user ?? null))
      .catch(() => setUser(null));
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUnread(d?.unread ?? 0))
      .catch(() => setUnread(0));
    setOpen(false);
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const authedLinks =
    user?.role === "master"
      ? [
          { href: "/orders", label: tr("orders") },
          { href: "/dashboard", label: tr("dashboard") },
          { href: "/chat", label: tr("chat") },
          { href: "/profile/setup", label: tr("profile") },
        ]
      : [
          { href: "/masters", label: tr("findMasters") },
          { href: "/orders", label: tr("orders") },
          { href: "/dashboard", label: tr("dashboard") },
          { href: "/chat", label: tr("chat") },
          { href: "/profile", label: tr("profile") },
        ];

  const links = user
    ? authedLinks
    : [
        { href: "/masters", label: tr("findMasters") },
        { href: "/orders", label: tr("orders") },
        { href: "/categories", label: tr("categories") },
        { href: "/how-it-works", label: tr("howItWorks") },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[rgba(255,255,255,0.92)] backdrop-blur-sm">
      <div className="page-wrap flex items-center justify-end gap-2 py-2 lg:justify-between lg:py-3">
        <nav className="hidden items-center gap-1 text-sm font-semibold lg:flex" aria-label="Навигатсияи асосӣ">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 transition-colors ${
                pathname.startsWith(l.href)
                  ? "bg-[var(--color-muted-bg)] text-[var(--color-primary)]"
                  : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted-bg)] hover:text-[var(--color-ink)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
          {user ? (
            <>
              <Link
                href="/notifications"
                className="btn btn-ghost relative px-2 py-1.5 sm:px-3 sm:py-2"
                aria-label={unread > 0 ? tr("notificationsUnread", { count: unread }) : tr("notifications")}
              >
                <IconBell size={18} />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="btn btn-ghost hidden text-sm md:inline-flex">
                  {tr("admin")}
                </Link>
              )}
              <button onClick={logout} className="btn btn-primary px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm">
                <IconLogout size={15} />
                {tr("logout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm">
                <IconLogin size={15} />
                {tr("login")}
              </Link>
              <Link href="/register" className="btn btn-primary px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm">
                <IconUserPlus size={15} />
                {tr("register")}
              </Link>
            </>
          )}

          <LanguageSwitcher className="shrink-0" />

          <div className="header-mobile-menu lg:hidden">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? tr("closeMenu") : tr("openMenu")}
            >
              {open ? <IconClose size={18} /> : <IconMenu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--color-border)] bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1 font-semibold" aria-label="Менюи мобилӣ">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 ${
                  pathname.startsWith(l.href)
                    ? "bg-[var(--color-muted-bg)] text-[var(--color-primary)]"
                    : "text-[var(--color-ink)] hover:bg-[var(--color-muted-bg)]"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link href="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 hover:bg-[var(--color-muted-bg)]">
                {tr("admin")}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
