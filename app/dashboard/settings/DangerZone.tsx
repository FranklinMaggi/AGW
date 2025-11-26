"use client";

export default function DangerZone() {
  async function handleDelete() {
    if (!confirm("Sei sicuro? Questa azione è irreversibile.")) return;

    const res = await fetch("/api/user/delete-account", {
      method: "POST",
    });

    if (!res.ok) {
      alert("Errore eliminazione account");
      return;
    }

    alert("Account eliminato");
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
