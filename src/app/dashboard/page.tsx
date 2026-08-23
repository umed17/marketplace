"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPostAuthRedirect } from "@/lib/post-auth-redirect";

type User = {
  id: string;
  firstName: string;
  role: "customer" | "master" | "admin";
  masterProfile?: { setupCompleted?: boolean } | null;
};

export default function DashboardIndex() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(async (r) => {
      if (!r.ok) return router.push("/login");
      const d = await r.json();
      setUser(d.user);
      router.replace(getPostAuthRedirect(d.user));
    });
  }, [router]);

  return <div className="page-wrap py-10">{user ? "Гузариш..." : "Боргирӣ..."}</div>;
}
