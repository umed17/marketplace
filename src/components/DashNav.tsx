"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashNav({ role }: { role: "master" | "customer" }) {
  const pathname = usePathname();
  const master = [
    ["/dashboard/master", "Dashboard"],
    ["/dashboard/master/orders", "Заказҳои нав"],
    ["/dashboard/master/offers", "Пешниҳодҳои ман"],
    ["/dashboard/master/jobs", "Заказҳои ман"],
    ["/chat", "Chat"],
    ["/profile", "Portfolio"],
    ["/reviews", "Reviews"],
    ["/settings", "Settings"],
  ];
  const customer = [
    ["/dashboard/customer", "Dashboard"],
    ["/dashboard/customer/orders", "Заказҳои ман"],
    ["/create-order", "Заказ гузоштан"],
    ["/masters", "Устоҳоро ёфтан"],
    ["/chat", "Chat"],
    ["/favorites", "Favorites"],
    ["/reviews", "Reviews"],
    ["/profile", "Profile"],
    ["/settings", "Settings"],
  ];
  const links = role === "master" ? master : customer;

  return (
    <nav className="mb-6 flex gap-2 overflow-auto pb-1" aria-label="Dashboard">
      {links.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className={`btn shrink-0 text-sm ${
            pathname === href || pathname.startsWith(`${href}/`)
              ? "btn-primary"
              : "btn-ghost"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
