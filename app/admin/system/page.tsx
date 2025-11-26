"use client";

export default function AdminSystem() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl admin-title">Controllo Sistema</h1>

      <div className="admin-card space-y-3">
        <p className="admin-muted">Strumenti e diagnostica:</p>
        <ul className="admin-muted list-disc pl-4">
          <li>Test API</li>
          <li>Stato KV</li>
          <li>Logs Worker</li>
          <li>Reset Bonus settimanale</li>
          <li>Health-check</li>
          <li>Sicurezza</li>
        </ul>
      </div>
    </div>
  );
}
