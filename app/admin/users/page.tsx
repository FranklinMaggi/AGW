"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import UserTable from "./UserTable";

export default function AdminUsersWrapper() {
  return (
    <Suspense fallback={<p className="admin-muted">Caricamento utenti...</p>}>
      <AdminUsers />
    </Suspense>
  );
}

function AdminUsers() {
  const params = useSearchParams();
  const token = params.get("token");

  const [userList, setUserList] = useState<any[]>([]);
  const [searchList, setSearchList] = useState("");
  const [id, setId] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function loadUserList() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/list`,
      {
        headers: { "x-admin-token": token ?? "" }
      }
    );

    const data = await res.json();
    if (!data.error) {
      setUserList(data.users);
    }
  }

  useEffect(() => {
    if (token) loadUserList();
  }, [token]);

  async function searchUser() {
    if (!id) return;
    setLoading(true);
    setMsg("");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/get`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }
    );

    const data = await res.json();
    setUser(data.error ? null : data);
    setMsg(data.error || "");
    setLoading(false);
  }

  if (!token)
    return <p className="admin-muted">Token mancante!</p>;

  return (
    <div className="space-y-6">
      <h1 className="admin-title text-2xl font-bold">Gestione Utenti</h1>

      <button
        onClick={async () => {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });

          const data = await res.json();

          if (data.error) {
            alert("Error creating user: " + data.error);
            return;
          }

          window.location.href = `/admin/users/${data.id}/edit?token=${token}`;
        }}
        className="admin-btn admin-btn-gold"
      >
        + Create New User
      </button>

      <UserTable users={userList} token={token} />

      <div className="admin-card space-y-4">
        <p className="admin-muted">Cerca utente per ID:</p>

        <input
          className="admin-input"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />

        <button
          onClick={searchUser}
          className="admin-btn admin-btn-gold"
        >
          {loading ? "Ricerca..." : "Cerca"}
        </button>

        {msg && <p className="admin-muted">{msg}</p>}
      </div>

      {user && (
        <div className="admin-card">
          <p className="admin-title">User loaded</p>
        </div>
      )}
    </div>
  );
}
