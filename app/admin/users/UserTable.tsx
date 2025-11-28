"use client";

import { useState } from "react";
import Image from "next/image";

export default function UserTable({ users }: { users: any[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const safeUsers = Array.isArray(users) ? users : [];

  const filtered = safeUsers.filter((u) =>
    JSON.stringify(u).toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleBulkDelete() {
    if (!confirm(`Eliminare ${selected.length} utenti?`)) return;

    for (const id of selected) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field: "delete" })
      });
    }

    alert("Utenti eliminati");
    window.location.reload();
  }

  return (
    <div className="admin-card p-4 space-y-4 overflow-auto">
      <input
        className="admin-input"
        placeholder="Cerca..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {selected.length > 0 && (
        <button
          onClick={handleBulkDelete}
          className="admin-btn admin-btn-danger"
        >
          Elimina selezionati ({selected.length})
        </button>
      )}

      <div className="overflow-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead>
            <tr>
              <Th></Th>
              <Th>Edit</Th>
              <Th>Delete</Th>
              <Th>ID</Th>
              <Th>Email</Th>
              <Th>Name</Th>
              <Th>Status</Th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((user) => (
              <tr key={user.id}>
                <Td>
                  <input
                    type="checkbox"
                    checked={selected.includes(user.id)}
                    onChange={() => toggle(user.id)}
                  />
                </Td>

                <Td>
                  <a
                    href={`/admin/users/${user.id}/edit`}
                    className="admin-btn admin-btn-blue text-xs"
                  >
                    Edit
                  </a>
                </Td>

                <Td>
                  <button
                    className="admin-btn admin-btn-danger text-xs"
                    onClick={async () => {
                      if (!confirm(`Eliminare ${user.email}?`)) return;

                      await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/user/update`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: user.id,
                            field: "delete"
                          })
                        }
                      );

                      alert("Utente eliminato");
                      window.location.reload();
                    }}
                  >
                    Delete
                  </button>
                </Td>

                <Td>{user.id}</Td>
                <Td>{user.email}</Td>
                <Td>{user.firstname} {user.lastname}</Td>
                <Td>{user.status?.suspended ? "Sospeso" : "Attivo"}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: any) {
  return (
    <th className="px-3 py-2 font-semibold text-[var(--admin-gold)] whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children }: any) {
  return <td className="px-3 py-2 whitespace-nowrap">{children}</td>;
}
