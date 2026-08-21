"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";

const links: { href: string; key: TranslationKey }[] = [
  { href: "/admin", key: "dashboard" },
  { href: "/admin/users", key: "users" },
  { href: "/admin/masters", key: "masters" },
  { href: "/admin/orders", key: "orders" },
  { href: "/admin/categories", key: "categories" },
  { href: "/admin/reviews", key: "reviews" },
  { href: "/admin/reports", key: "reports" },
];

export function AdminNav() {
  const pathname = usePathname();
  const { tr } = useLocale();
  return (
    <nav className="mb-6 flex gap-2 overflow-auto pb-1" aria-label={tr("adminNav")}>
      {links.map(({ href, key }) => (
        <Link
          key={href}
          href={href}
          className={`btn shrink-0 text-sm ${pathname === href || (href !== "/admin" && pathname.startsWith(href)) ? "btn-primary" : "btn-ghost"}`}
        >
          {tr(key)}
        </Link>
      ))}
    </nav>
  );
}
