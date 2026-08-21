"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
      if (d.user.role === "admin") router.replace("/admin");
      else if (d.user.role === "master") {
        if (!d.user.masterProfile?.setupCompleted) router.replace("/profile/setup");
        else router.replace("/dashboard/master");
      } else router.replace("/dashboard/customer");
    });
  }, [router]);

  return <div className="page-wrap py-10">{user ? "Гузариш..." : "Боргирӣ..."}</div>;
}
