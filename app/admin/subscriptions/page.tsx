"use client";

export default function AdminSubscriptions() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl admin-title">Gestione Abbonamenti</h1>

      <div className="admin-card space-y-3">
        <p className="admin-muted">Qui potrai vedere e gestire:</p>
        <ul className="admin-muted list-disc pl-4">
          <li>Abbonamenti attivi</li>
          <li>Data scadenza</li>
          <li>Rinnovi manuali</li>
          <li>Anomalie abbonamenti</li>
        </ul>
      </div>
    </div>
  );
}
