"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPostAuthRedirect } from "@/lib/post-auth-redirect";
import { useLocale } from "@/components/LocaleProvider";

type User = {
  id: string;
  firstName: string;
  role: "customer" | "master" | "admin";
  masterProfile?: { setupCompleted?: boolean } | null;
};

export default function DashboardIndex() {
  const router = useRouter();
  const { tr } = useLocale();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(async (r) => {
      if (!r.ok) return router.push("/login");
      const d = await r.json();
      setUser(d.user);
      router.replace(getPostAuthRedirect(d.user));
    });
  }, [router]);

  return <div className="page-wrap py-10">{user ? tr("redirecting") : tr("loading")}</div>;
}
