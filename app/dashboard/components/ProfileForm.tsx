"use client";

import { useState } from "react";

export default function ProfileForm({ user }: { user: any }) {
  const [form, setForm] = useState({
    firstname: user.firstname || "",
    lastname: user.lastname || "",
    nickname: user.nickname || "",
    birthdate: user.personal?.birthdate || "",
    gender: user.personal?.gender || "",
    height: user.personal?.height || "",
    weight: user.personal?.weight || "",
    job: user.personal?.job || "",
  });

  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);

    const res = await fetch("/api/user/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Errore aggiornamento profilo");
      return;
    }

    alert("Profilo aggiornato");
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Dati Personali</h2>

      <div className="grid grid-cols-2 gap-4">
        {Object.keys(form).map((key) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm font-medium capitalize">{key}</label>
            <input
              type="text"
              className="border p-2 rounded bg-gray-50"
              value={(form as any)[key]}
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.value })
              }
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Salvataggio..." : "Salva"}
      </button>
    </div>
  );
}
