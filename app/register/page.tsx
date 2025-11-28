"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  async function handleRegister() {
    setError("");
    setOk(false);

    const res = await fetch("/api/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, firstname, lastname, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      setError(data.error || "Registrazione fallita");
      return;
    }

    setOk(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm p-6 space-y-4 border rounded-lg bg-white">
        <h1 className="text-2xl font-bold text-center">Registrati</h1>

        <input className="w-full border px-3 py-2 rounded" placeholder="Nome" value={firstname} onChange={e => setFirstname(e.target.value)} />
        <input className="w-full border px-3 py-2 rounded" placeholder="Cognome" value={lastname} onChange={e => setLastname(e.target.value)} />
        <input className="w-full border px-3 py-2 rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border px-3 py-2 rounded" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {ok && <p className="text-sm text-green-600">Registrazione completata. Ora puoi accedere.</p>}

        <button onClick={handleRegister} className="w-full py-2 bg-black text-white rounded">
          Crea account
        </button>
      </div>
    </main>
  );
}
