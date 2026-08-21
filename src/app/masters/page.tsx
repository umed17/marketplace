import { Suspense } from "react";
import MastersClient from "./MastersClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="page-wrap py-8">Боргирӣ...</div>}>
      <MastersClient />
    </Suspense>
  );
}
