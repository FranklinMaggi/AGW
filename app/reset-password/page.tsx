"use client";
import { useState } from "react";

export default function ResetPasswordPage({ searchParams }: any) {
  const token = searchParams.token;
  const [done, setDone] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    const pass = e.target.password.value;

    const res = await fetch("/api/auth/do-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password: pass })
    });

    const data = await res.json();
    if (data.ok) setDone(true);
  }

  if (!token) return <p>Token mancante.</p>;

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold mb-4">Imposta nuova password</h1>

      {done ? (
        <p>Password aggiornata. Ora puoi fare login.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="password" name="password" placeholder="Nuova password" className="border p-2" />
          <button className="bg-green-600 text-white p-2 rounded">Aggiorna</button>
        </form>
      )}
    </main>
  );
}
