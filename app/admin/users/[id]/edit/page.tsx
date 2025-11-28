"use client";
import type { User } from "app/admin/src/types/Users";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

/* ============================================================================
   PAGE: ADMIN — EDIT USER
   Allineato completamente al backend Workers.
============================================================================ */

export default function EditUser() {
  const { id } = useParams();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // ==========================================================
  // LOAD USER FROM BFF
  // ==========================================================
  async function loadUser() {
    setLoading(true);

    const res = await fetch(`/api/admin/users`, { cache: "no-store" });
    const data = await res.json();

    if (!data.ok) {
      setUser(null);
      setLoading(false);
      return;
    }

    const found = data.users.find((u: any) => u.id === id);
    setUser(found || null);
    setLoading(false);
  }

  // ==========================================================
  // GENERIC FIELD UPDATE (supports nested fields)
  // ==========================================================
  async function update(field: string, value: any) {
    if (!user) return;

    setSaving(true);
    setMsg("");

    const res = await fetch(`/api/admin/user-update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        field,
        value,
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      setMsg("❌ " + (data.error || "Errore salvataggio"));
      setSaving(false);
      return;
    }

    setUser(data.user);
    setMsg("✔ Salvato");
    setSaving(false);
  }

  // ==========================================================
  // RESET PASSWORD
  // ==========================================================
  async function resetPassword() {
    const newPass = prompt("Inserisci nuova password:");
    if (!newPass || !user) return;

    const res = await fetch(`/api/user/update-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        oldPassword: "", // bypassato dall'admin
        newPassword: newPass,
      }),
    });

    const data = await res.json();
    if (data.ok) alert("Password aggiornata");
    else alert("Errore durante l'aggiornamento");
  }

  // ==========================================================
  // DELETE USER
  // ==========================================================
  async function deleteUser() {
    if (!user) return;
    if (!confirm("Confermi eliminazione DEFINITIVA?")) return;

    const res = await fetch(`/api/admin/user-update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user.id,
        field: "delete",
      }),
    });

    const data = await res.json();

    if (data.deleted) {
      alert("Utente eliminato");
      window.location.href = "/admin/users";
    } else {
      alert("Errore eliminazione");
    }
  }

  // ==========================================================
  // LOAD ON MOUNT
  // ==========================================================
  useEffect(() => {
    loadUser();
  }, []);

  // ==========================================================
  // RENDERING
  // ==========================================================
  if (loading) return <p className="p-6 admin-muted">Loading...</p>;
  if (!user) return <p className="p-6 text-red-400">User not found</p>;

  return (
    <div className="space-y-8">
      <h1 className="admin-title text-3xl font-bold">
        Editing User #{user.index} — {user.nickname}
      </h1>

      <p className="admin-muted">{msg}</p>

      {/* ======================================================
         BASIC INFO
      ====================================================== */}
      <section className="admin-card p-6 space-y-4">
        <h2 className="admin-title text-xl">Profilo</h2>

        <Field label="Email" value={user.email} update={(v)=>update("email", v)} />
        <Field label="Firstname" value={user.firstname} update={(v)=>update("firstname", v)} />
        <Field label="Lastname" value={user.lastname} update={(v)=>update("lastname", v)} />
      </section>

      {/* ======================================================
         STATS
      ====================================================== */}
      <section className="admin-card p-6 space-y-4">
        <h2 className="admin-title text-xl">Stats</h2>

        <Field
          label="KRM Totale"
          value={user.stats?.krm_total}
          update={(v)=>update("stats.krm_total", Number(v))}
        />

        <Field
          label="Livello"
          value={user.stats?.level_total}
          update={(v)=>update("stats.level_total", Number(v))}
        />
      </section>

      {/* ======================================================
         STATUS
      ====================================================== */}
      <section className="admin-card p-6 space-y-4">
        <h2 className="admin-title text-xl">Status</h2>

        <select
          className="admin-input"
          defaultValue={user.status?.suspended ? "suspended" : "active"}
          onChange={(e) => update("status.suspended", e.target.value === "suspended")}
        >
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </section>

      {/* RESET PASSWORD */}
      <div className="admin-card p-6">
        <button className="admin-btn admin-btn-blue" onClick={resetPassword}>
          Reset Password
        </button>
      </div>

      {/* DELETE USER */}
      <div className="admin-card p-6">
        <button className="admin-btn admin-btn-danger" onClick={deleteUser}>
          Delete User
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   FIELD COMPONENT
============================================================================ */
type FieldProps<T> = {
  label: string;
  value: T;
  update: (v: T) => void;
};

function Field<T>({ label, value, update }: FieldProps<T>) {
  return (
    <div className="space-y-2">
      <label className="admin-muted text-sm">{label}</label>

      <input
        className="admin-input"
        defaultValue={value != null ? String(value) : ""}
        onBlur={(e) => {
          let v: any = e.target.value;
          if (typeof value === "number") v = Number(v);
          update(v as T);
        }}
      />
    </div>
  );
}
"use client";
import type { User } from "app/admin/src/types/Users";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

/* ============================================================================
   PAGE: ADMIN — EDIT USER
   Allineato completamente al backend Workers.
============================================================================ */

export default function EditUser() {
  const { id } = useParams();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // ==========================================================
  // LOAD USER FROM BFF
  // ==========================================================
  async function loadUser() {
    setLoading(true);

    const res = await fetch(`/api/admin/users`, { cache: "no-store" });
    const data = await res.json();

    if (!data.ok) {
      setUser(null);
      setLoading(false);
      return;
    }

    const found = data.users.find((u: any) => u.id === id);
    setUser(found || null);
    setLoading(false);
  }

  // ==========================================================
  // GENERIC FIELD UPDATE (supports nested fields)
  // ==========================================================
  async function update(field: string, value: any) {
    if (!user) return;

    setSaving(true);
    setMsg("");

    const res = await fetch(`/api/admin/user-update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        field,
        value,
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      setMsg("❌ " + (data.error || "Errore salvataggio"));
      setSaving(false);
      return;
    }

    setUser(data.user);
    setMsg("✔ Salvato");
    setSaving(false);
  }

  // ==========================================================
  // RESET PASSWORD
  // ==========================================================
  async function resetPassword() {
    const newPass = prompt("Inserisci nuova password:");
    if (!newPass || !user) return;

    const res = await fetch(`/api/user/update-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        oldPassword: "", // bypassato dall'admin
        newPassword: newPass,
      }),
    });

    const data = await res.json();
    if (data.ok) alert("Password aggiornata");
    else alert("Errore durante l'aggiornamento");
  }

  // ==========================================================
  // DELETE USER
  // ==========================================================
  async function deleteUser() {
    if (!user) return;
    if (!confirm("Confermi eliminazione DEFINITIVA?")) return;

    const res = await fetch(`/api/admin/user-update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user.id,
        field: "delete",
      }),
    });

    const data = await res.json();

    if (data.deleted) {
      alert("Utente eliminato");
      window.location.href = "/admin/users";
    } else {
      alert("Errore eliminazione");
    }
  }

  // ==========================================================
  // LOAD ON MOUNT
  // ==========================================================
  useEffect(() => {
    loadUser();
  }, []);

  // ==========================================================
  // RENDERING
  // ==========================================================
  if (loading) return <p className="p-6 admin-muted">Loading...</p>;
  if (!user) return <p className="p-6 text-red-400">User not found</p>;

  return (
    <div className="space-y-8">
      <h1 className="admin-title text-3xl font-bold">
        Editing User #{user.index} — {user.nickname}
      </h1>

      <p className="admin-muted">{msg}</p>

      {/* ======================================================
         BASIC INFO
      ====================================================== */}
      <section className="admin-card p-6 space-y-4">
        <h2 className="admin-title text-xl">Profilo</h2>

        <Field label="Email" value={user.email} update={(v)=>update("email", v)} />
        <Field label="Firstname" value={user.firstname} update={(v)=>update("firstname", v)} />
        <Field label="Lastname" value={user.lastname} update={(v)=>update("lastname", v)} />
      </section>

      {/* ======================================================
         STATS
      ====================================================== */}
      <section className="admin-card p-6 space-y-4">
        <h2 className="admin-title text-xl">Stats</h2>

        <Field
          label="KRM Totale"
          value={user.stats?.krm_total}
          update={(v)=>update("stats.krm_total", Number(v))}
        />

        <Field
          label="Livello"
          value={user.stats?.level_total}
          update={(v)=>update("stats.level_total", Number(v))}
        />
      </section>

      {/* ======================================================
         STATUS
      ====================================================== */}
      <section className="admin-card p-6 space-y-4">
        <h2 className="admin-title text-xl">Status</h2>

        <select
          className="admin-input"
          defaultValue={user.status?.suspended ? "suspended" : "active"}
          onChange={(e) => update("status.suspended", e.target.value === "suspended")}
        >
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </section>

      {/* RESET PASSWORD */}
      <div className="admin-card p-6">
        <button className="admin-btn admin-btn-blue" onClick={resetPassword}>
          Reset Password
        </button>
      </div>

      {/* DELETE USER */}
      <div className="admin-card p-6">
        <button className="admin-btn admin-btn-danger" onClick={deleteUser}>
          Delete User
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   FIELD COMPONENT
============================================================================ */
type FieldProps<T> = {
  label: string;
  value: T;
  update: (v: T) => void;
};

function Field<T>({ label, value, update }: FieldProps<T>) {
  return (
    <div className="space-y-2">
      <label className="admin-muted text-sm">{label}</label>

      <input
        className="admin-input"
        defaultValue={value != null ? String(value) : ""}
        onBlur={(e) => {
          let v: any = e.target.value;
          if (typeof value === "number") v = Number(v);
          update(v as T);
        }}
      />
    </div>
  );
}
