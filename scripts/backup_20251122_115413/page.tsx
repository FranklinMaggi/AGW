"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const USER_ID = "a6419b90-2ebd-4a3f-a92e-3da0f20c222a";

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    setLoading(true);
    const res = await fetch("${NEXT_PUBLIC_API_URL}/api/user/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: USER_ID }),
    });

    const data = await res.json();
    setUser(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-xl">
        Caricamento...
      </main>
    );
  }

  if (!user || user.error) {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-500">
        Errore nel caricamento del profilo.
      </main>
    );
  }

  // Calcolo giorni rimanenti abbonamento
  const daysLeft = user.subscription?.expiresAt
    ? Math.max(
        0,
        Math.floor((user.subscription.expiresAt - Date.now()) / 86400000)
      )
    : 0;

  return (
    <main className="min-h-screen bg-black text-white p-6 space-y-8">
      <h1 className="text-3xl font-bold text-yellow-300">
        AGW Dashboard
      </h1>

      {/* SEZIONE PROFILO */}
      <section className="p-4 bg-neutral-900 rounded-xl border border-neutral-700">
        <h2 className="text-2xl font-semibold text-yellow-300">
          Profilo Utente
        </h2>

        <p className="mt-2 text-neutral-300">
          ID: <span className="text-neutral-400">{user.id}</span>
        </p>

        <p className="mt-1">
          Livello: <span className="text-yellow-300">{user.stats.level}</span>
        </p>

        <p className="mt-1">
          KRM: <span className="text-yellow-300">{user.stats.krm}</span>
        </p>
      </section>

      {/* ABBONAMENTO */}
      <section className="p-4 bg-neutral-900 rounded-xl border border-neutral-700">
        <h2 className="text-xl font-semibold text-yellow-300">Abbonamento</h2>

        <p className="mt-2">
          Tipo:{" "}
          <span className="text-yellow-400">
            {user.subscription.type || "Nessuno"}
          </span>
        </p>

        <p>
          Scade tra:{" "}
          <span className="text-yellow-400">
            {user.subscription.type ? `${daysLeft} giorni` : "---"}
          </span>
        </p>
      </section>

      {/* BONUS */}
      <section className="p-4 bg-neutral-900 rounded-xl border border-neutral-700">
        <h2 className="text-xl font-semibold text-yellow-300">Bonus</h2>

        {user.bonus?.award ? (
          <>
            <p>Premio: <span className="text-yellow-400">{user.bonus.award}</span></p>
            <p>Valido fino al:{" "}
              <span className="text-yellow-400">
                {new Date(user.bonus.expiresAt).toLocaleDateString()}
              </span>
            </p>
          </>
        ) : (
          <p className="text-neutral-400">Nessun bonus attivo</p>
        )}
      </section>

      {/* STATISTICHE */}
      <section className="p-4 bg-neutral-900 rounded-xl border border-neutral-700">
        <h2 className="text-xl font-semibold text-yellow-300">
          Statistiche Settimanali
        </h2>

        <p className="mt-2">
          Day acquistati negli ultimi 7 giorni:{" "}
          <span className="text-yellow-300">{user.stats.dayPurchasesLast7Days}</span>
        </p>
      </section>
    </main>
  );
}
