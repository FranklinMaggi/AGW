"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Errore login");
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <form
        onSubmit={handleLogin}
        className="bg-neutral-900 p-8 rounded-xl shadow-xl w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl text-[hsl(var(--agw-gold))] font-bold text-center">
          Admin Login
        </h1>

        {error && (
          <p className="text-red-500 text-center">{error}</p>
        )}

        <input
          className="admin-input w-full"
          type="email"
          placeholder="Email admin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="admin-input w-full"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="admin-btn admin-btn-gold w-full"
        >
          Entra
        </button>
      </form>
    </main>
  );
}
