"use client";

import { useState } from "react";

export default function SecurityPanel() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  async function changePassword() {
    const res = await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPass, newPass }),
    });

    if (!res.ok) {
      alert("Errore nel cambio password");
      return;
    }

    alert("Password aggiornata");
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Sicurezza</h2>

      <label className="flex flex-col mb-2">
        Vecchia password
        <input
          type="password"
          className="border p-2 rounded"
          onChange={(e) => setOldPass(e.target.value)}
        />
      </label>

      <label className="flex flex-col mb-2">
        Nuova password
        <input
          type="password"
          className="border p-2 rounded"
          onChange={(e) => setNewPass(e.target.value)}
        />
      </label>

      <button
        onClick={changePassword}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Aggiorna
      </button>
    </div>
  );
}
