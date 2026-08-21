import { Suspense } from "react";
import CreateOrderClient from "./CreateOrderClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="page-wrap py-8">Боргирӣ...</div>}>
      <CreateOrderClient />
    </Suspense>
  );
}
