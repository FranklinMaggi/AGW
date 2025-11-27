//admin/analytics/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

export default function AnalyticsWrapper() {
  return (
    <Suspense fallback={<p className="admin-muted p-6">Caricamento...</p>}>
      <AnalyticsPage />
    </Suspense>
  );
}

function AnalyticsPage() {
  // Anche se non lo usi, serve per evitare hydration mismatch
  const params = useSearchParams();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl admin-title">Analitiche Avanzate</h1>

      <div className="admin-card space-y-3">
        <p className="admin-muted">Statistiche e trend della piattaforma:</p>

        <ul className="admin-muted list-disc pl-4">
          <li>Crescita utenti</li>
          <li>Retention settimanale / mensile</li>
          <li>Day acquistati nel tempo</li>
          <li>Missioni completate</li>
          <li>Andamento KRM</li>
        </ul>
      </div>
    </div>
  );
}
