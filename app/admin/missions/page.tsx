"use client";

export default function AdminMissions() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl admin-title">Gestione Missioni</h1>

      <div className="admin-card space-y-3">
        <p className="admin-muted">Controlla e gestisci le missioni globali:</p>
        <ul className="admin-muted list-disc pl-4">
          <li>Lista missioni</li>
          <li>Creazione / Modifica / Rimozione</li>
          <li>Missioni attive</li>
          <li>Completamenti sospetti</li>
        </ul>
      </div>
    </div>
  );
}
