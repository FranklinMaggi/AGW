"use client";

import { useState } from "react";

export default function EmailPreferences({
  prefs,
  userId,
}: {
  prefs: any;
  userId: string;
}) {
  const [state, setState] = useState(prefs);

  async function savePrefs() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update-email-prefs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, prefs: state }),
    });

    if (!res.ok) {
      alert("Errore aggiornamento preferenze email");
      return;
    }

    alert("Preferenze aggiornate");
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Preferenze Email</h2>

      <div className="flex flex-col gap-3">
        {Object.keys(state).map((key) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={(state as any)[key]}
              onChange={(e) =>
                setState({
                  ...state,
                  [key]: e.target.checked,
                })
              }
            />
            <span className="capitalize">{key}</span>
          </label>
        ))}
      </div>

      <button
        onClick={savePrefs}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        Salva preferenze
      </button>
    </div>
  );
}
