import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <section className="section-muted py-12 md:py-16">
      <div className="page-wrap">
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </section>
  );
}
