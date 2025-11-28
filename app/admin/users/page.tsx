"use client";

import { Suspense, useEffect, useState } from "react";
import UserTable from "./UserTable";

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<p className="admin-muted">Caricamento utenti...</p>}>
      <AdminUsers />
    </Suspense>
  );
}

function AdminUsers() {
  const [userList, setUserList] = useState<any[]>([]);
  const [searchId, setSearchId] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function loadUserList() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/list`, {
      method: "GET",
      cache: "no-store"
    });

    const data = await res.json();
    if (data.ok) {
      setUserList(data.users);
    } else {
      setMsg(data.error || "Errore di caricamento utenti");
    }
  }

  useEffect(() => {
    loadUserList();
  }, []);

  async function searchUser() {
    if (!searchId) return;

    setLoading(true);
    setMsg("");

    const res = await fetch(`/api/admin/user/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: searchId })
    });

    const data = await res.json();
    if (data.error) {
      setSelectedUser(null);
      setMsg(data.error);
    } else {
      setSelectedUser(data);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="admin-title text-2xl font-bold">Gestione Utenti</h1>

      <button
        onClick={async () => {
          const res = await fetch(`/api/admin/user/create`, {
            method: "POST"
          });

          const data = await res.json();

          if (data.error) {
            alert("Errore creando utente: " + data.error);
            return;
          }

          window.location.href = `/admin/users/${data.id}/edit`;
        }}
        className="admin-btn admin-btn-gold"
      >
        + Create New User
      </button>

      <UserTable users={userList} />

      <div className="admin-card space-y-4">
        <p className="admin-muted">Cerca utente per ID:</p>

        <input
          className="admin-input"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />

        <button
          onClick={searchUser}
          className="admin-btn admin-btn-gold"
        >
          {loading ? "Ricerca..." : "Cerca"}
        </button>

        {msg && <p className="admin-muted">{msg}</p>}
      </div>

      {selectedUser && (
        <div className="admin-card">
          <p className="admin-title">User loaded</p>
        </div>
      )}
    </div>
  );
}
