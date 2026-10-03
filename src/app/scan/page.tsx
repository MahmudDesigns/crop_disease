import { Suspense } from "react";
import ScanClient from "./scan-client";

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <ScanClient />
    </Suspense>
  );
}
