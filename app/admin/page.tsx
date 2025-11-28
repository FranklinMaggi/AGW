"use client";

import { useEffect, useState } from "react";

export default function AdminHome() {
  const [valid, setValid] = useState<boolean | null>(null);
  const [overview, setOverview] = useState<any>(null);

  // Recupera sessione admin dal browser
  const sessionId =
    typeof window !== "undefined"
      ? localStorage.getItem("agw_admin_session")
      : null;

  async function validate() {
    if (!sessionId) {
      setValid(false);
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/me`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId })
    });

    const data = await res.json();

    setValid(data.ok === true);

    if (data.ok) {
      await loadOverview();
    }
  }

  async function loadOverview() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/overview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId })
    });

    const data = await res.json();
    setOverview(data);
  }

  useEffect(() => {
    validate();
  }, []);

  if (valid === null)
    return <p className="admin-muted p-6">Verifica in corso...</p>;

  if (!valid)
    return (
      <div className="admin-card p-6">
        <p className="admin-btn-danger p-2 rounded-md text-center">
          Accesso negato
        </p>
      </div>
    );

  if (!overview)
    return <p className="admin-muted p-6">Caricamento dati...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl admin-title">Admin Dashboard AGW</h1>

      <div className="admin-card space-y-6">
        <h2 className="text-xl admin-title">Panoramica Sistema</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Stat label="Utenti totali" value={overview.totalUsers} />
          <Stat label="Abbonamenti attivi" value={overview.activeSubscriptions} />
          <Stat label="Bonus attivi" value={overview.activeBonuses} />
          <Stat label="KRM totali generati" value={overview.totalKRM} />
          <Stat label="Day acquistati" value={overview.totalDay} />
          <Stat label="Missioni completate" value={overview.totalMissions} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: any) {
  return (
    <div className="admin-stat space-y-1">
      <p className="admin-muted">{label}</p>
      <p className="admin-stat-value">{value}</p>
    </div>
  );
}
