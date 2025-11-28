"use client";

export default function DangerZone() {
  async function handleDelete() {
    if (!confirm("Sei sicuro? Questa azione è irreversibile.")) return;

    // 1) Delete account on backend via BFF
    const res = await fetch("/api/user/delete-account", {
      method: "POST",
    });

    if (!res.ok) {
      alert("Errore durante l'eliminazione dell'account.");
      return;
    }

    // 2) Remove session cookie client-side (fail-safe)
    document.cookie = "agw_session=; Path=/; Max-Age=0; SameSite=Lax;";

    // 3) Clear any local/session storage if needed
    localStorage.clear();
    sessionStorage.clear();

    // 4) Notify user and redirect securely
    alert("Account eliminato correttamente.");
    window.location.href = "/";
  }

  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-red-700 mb-4">Zona Pericolosa</h2>

      <button
        onClick={handleDelete}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Elimina Account
      </button>
    </div>
  );
}
