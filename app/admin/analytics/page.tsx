"use client";

export default function AdminAnalytics() {
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
