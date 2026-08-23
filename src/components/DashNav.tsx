"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";

export function DashNav({ role }: { role: "master" | "customer" }) {
  const pathname = usePathname();
  const { tr } = useLocale();

  const master = [
    ["/dashboard/master", tr("dashboard")],
    ["/dashboard/master/orders", tr("newOrders")],
    ["/dashboard/master/offers", tr("myOffers")],
    ["/dashboard/master/jobs", tr("myOrders")],
    ["/chat", tr("chat")],
    ["/profile", tr("profile")],
    ["/reviews", tr("reviewsSection")],
    ["/settings", tr("settings")],
  ];
  const customer = [
    ["/dashboard/customer", tr("dashboard")],
    ["/dashboard/customer/orders", tr("myOrders")],
    ["/create-order", tr("createOrder")],
    ["/masters", tr("findMasters")],
    ["/chat", tr("chat")],
    ["/favorites", tr("favorites")],
    ["/reviews", tr("reviewsSection")],
    ["/profile", tr("profile")],
    ["/settings", tr("settings")],
  ];
  const links = role === "master" ? master : customer;

  return (
    <nav className="mb-6 flex gap-2 overflow-auto pb-1" aria-label="Dashboard">
      {links.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className={`btn shrink-0 text-sm ${
            pathname === href || pathname.startsWith(`${href}/`) ? "btn-primary" : "btn-ghost"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
