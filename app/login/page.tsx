"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [failCount, setFailCount] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    // EMAIL NON ESISTE
    if (res.status === 404 && data.error === "EMAIL_NOT_FOUND") {
      setError("Questa email non risulta registrata.");
      return;
    }

    // PASSWORD ERRATA
    if (res.status === 401 && data.error === "WRONG_PASSWORD") {
      setFailCount(n => n + 1);
      setError("Password errata. Riprova.");
      return;
    }

    // LOGIN OK
    if (data.ok) {
      window.location.href = "/dashboard";
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Accedi</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="p-3 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="p-3 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Accedi
          </button>
        </form>

        {/* EMAIL NON REGISTRATA */}
        {error === "Questa email non risulta registrata." && (
          <div className="mt-5 text-center">
            <p className="mb-3">Vuoi creare un nuovo account?</p>
            <a
              href={`/register?email=${encodeURIComponent(email)}`}
              className="text-blue-600 underline font-semibold"
            >
              Registrati con questa email
            </a>
          </div>
        )}

        {/* DOPO 3 ERRORI PASSWORD → PASSWORD RESET */}
        {failCount >= 3 && error !== "Questa email non risulta registrata." && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-yellow-800 font-medium mb-2">
              Problemi ad accedere?
            </p>
            <a
              href={`/forgot-password?email=${encodeURIComponent(email)}`}
              className="text-blue-600 underline font-semibold"
            >
              Reimposta la password
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
