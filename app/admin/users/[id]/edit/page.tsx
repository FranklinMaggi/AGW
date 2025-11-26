"use client";
import type { User } from "app/admin/src/types/Users";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

/* ============================================================================
   PAGE: ADMIN — EDIT USER
   Gestisce profilo, mailing, stats, subscription, bonus,
   discipline, avatar, delete, e ora anche RESET PASSWORD.
============================================================================ */

export default function EditUser() {
  const { id } = useParams();
  const params = useSearchParams();
  const token = params.get("token");

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // ==========================================================
  // FETCH USER
  // ==========================================================
  async function load() {
    setLoading(true);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/get`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      }
    );

    const data = await res.json();
    setUser(data.error ? null : data);
    setLoading(false);
  }

  // ==========================================================
  // GENERIC UPDATE (deep field edit)
  // ==========================================================
  async function update(field: string, value: any) {
    if (!user) return;

    setSaving(true);
    setMsg("");

    const newUser = { ...user };

    const parts = field.split(".");
    let pointer: any = newUser;

    for (let i = 0; i < parts.length - 1; i++) {
      pointer = pointer[parts[i]];
    }

    pointer[parts[parts.length - 1]] = value;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/user/save`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          id,
          userData: newUser
        })
      }
    );

    const data = await res.json();

    if (data.error) {
      setMsg("❌ " + data.error);
      setSaving(false);
      return;
    }

    setUser(data.user);
    setMsg("✔ Saved");
    setSaving(false);
  }

  // load user
  useEffect(() => {
    if (token) load();
  }, [token]);

  // ==========================================================
  // RENDER STATES
  // ==========================================================
  if (!token) return <p className="admin-muted p-6">Missing token</p>;
  if (loading) return <p className="p-6 admin-muted">Loading...</p>;
  if (!user) return <p className="p-6 text-red-400">User not found</p>;

  // ==========================================================
  // PAGE JSX
  // ==========================================================
  return (
    <div className="space-y-8">

      <h1 className="admin-title text-3xl font-bold">
        Editing User #{user.index} — {user.nickname}
      </h1>
      <p className="admin-muted">{msg}</p>

      {/* ======================================================
         AVATAR + BASIC INFO
      ====================================================== */}
      <section className="admin-card p-6 space-y-4">
        <h2 className="admin-title text-xl">Avatar & Identity</h2>

        <div className="flex items-center gap-6">
          <img
            src={user.profile_image || user.avatar_ai || "/default-avatar.png"}
            className="w-24 h-24 rounded-full object-cover border border-[var(--admin-border)]"
          />

          <div className="flex flex-col gap-3">
            <p className="admin-muted text-sm">
              Profile image + AI avatar management coming soon
            </p>

            <button className="admin-btn admin-btn-blue opacity-60 cursor-not-allowed">
              Upload Profile Image (soon)
            </button>
            <button className="admin-btn admin-btn-gold opacity-60 cursor-not-allowed">
              Generate AI Avatar (soon)
            </button>
          </div>
        </div>

        <Field label="Nickname" value={user.nickname} update={(v)=>update("nickname", v)} />
        <Field label="First Name" value={user.firstname} update={(v)=>update("firstname", v)} />
        <Field label="Last Name" value={user.lastname} update={(v)=>update("lastname", v)} />

      </section>

      {/* ======================================================
         PASSWORD RESET — NEW FEATURE
      ====================================================== */}
      <section className="admin-card p-6 space-y-4 border-red-300">
        <h2 className="admin-title text-xl">Reset Password</h2>

        <form
          action="/api/auth/admin-reset-password"
          method="POST"
          className="flex flex-col gap-3"
        >
          <input type="hidden" name="id" value={user.id} />
          <input type="hidden" name="token" value={token} />

          <input
            type="password"
            name="new_password"
            placeholder="Nuova password"
            className="admin-input"
          />

          <input
            type="password"
            name="confirm_password"
            placeholder="Conferma password"
            className="admin-input"
          />

          <button className="admin-btn admin-btn-blue">
            Aggiorna password
          </button>
        </form>
      </section>

      {/* ======================================================
         MAILING
      ====================================================== */}
      <section className="admin-card p-6 space-y-4">
        <h2 className="admin-title text-xl">Mailing / Contact</h2>

        <Field label="Primary Email" value={user.mailing.primary} update={(v)=>update("mailing.primary", v)} />
        <Field label="Secondary Email" value={user.mailing.secondary} update={(v)=>update("mailing.secondary", v)} />
        <Field label="Phone" value={user.phone} update={(v)=>update("phone", v)} />

        <div className="space-y-2">
          <label className="admin-muted text-sm">Verified?</label>
          <select
            className="admin-input"
            defaultValue={String(user.mailing.verified)}
            onChange={(e) => update("mailing.verified", e.target.value === "true")}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
      </section>

      {/* ======================================================
         PERSONAL
      ====================================================== */}
      <section className="admin-card p-6 space-y-4">
        <h2 className="admin-title text-xl">Personal Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Birthdate" value={user.personal.birthdate} update={(v)=>update("personal.birthdate", v)} />
          <Field label="Gender" value={user.personal.gender} update={(v)=>update("personal.gender", v)} />
          <Field label="Job" value={user.personal.job} update={(v)=>update("personal.job", v)} />
          <Field label="Weight" value={user.personal.weight} update={(v)=>update("personal.weight", Number(v))} />
          <Field label="Height" value={user.personal.height} update={(v)=>update("personal.height", Number(v))} />
        </div>
      </section>

      {/* ======================================================
         STATS
      ====================================================== */}
      <section className="admin-card p-6 space-y-4">
        <h2 className="admin-title text-xl">Stats</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="Level Total" value={user.stats.level_total} update={(v)=>update("stats.level_total", Number(v))} />
          <Field label="Level Year" value={user.stats.level_year} update={(v)=>update("stats.level_year", Number(v))} />
          <Field label="Rank Month" value={user.stats.rank_month} update={(v)=>update("stats.rank_month", Number(v))} />
          <Field label="Motivation Week" value={user.stats.motivation_week} update={(v)=>update("stats.motivation_week", Number(v))} />
          <Field label="KRM Total" value={user.stats.krm_total} update={(v)=>update("stats.krm_total", Number(v))} />
          <Field label="KRM Year" value={user.stats.krm_year} update={(v)=>update("stats.krm_year", Number(v))} />
          <Field label="KRM Month" value={user.stats.krm_month} update={(v)=>update("stats.krm_month", Number(v))} />
          <Field label="KRM Week" value={user.stats.krm_week} update={(v)=>update("stats.krm_week", Number(v))} />
          <Field label="KRM Day" value={user.stats.krm_day} update={(v)=>update("stats.krm_day", Number(v))} />
        </div>
      </section>

      {/* ======================================================
         DISCIPLINE
      ====================================================== */}
      <section className="admin-card p-6 space-y-4">
        <h2 className="admin-title text-xl">Discipline</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Daily Completed" value={user.discipline.daily_completed} update={(v)=>update("discipline.daily_completed", Number(v))} />
          <Field label="Daily Goal" value={user.discipline.daily_goal} update={(v)=>update("discipline.daily_goal", Number(v))} />
          <Field label="Weekly Completed" value={user.discipline.weekly_completed} update={(v)=>update("discipline.weekly_completed", Number(v))} />
          <Field label="Weekly Goal" value={user.discipline.weekly_goal} update={(v)=>update("discipline.weekly_goal", Number(v))} />
        </div>
      </section>

      {/* ======================================================
         SUBSCRIPTION
      ====================================================== */}
      <section className="admin-card p-6 space-y-4">
        <h2 className="admin-title text-xl">Subscription</h2>

        <Field label="Type" value={user.subscription.type} update={(v)=>update("subscription.type", v)} />
        <Field label="Payment Status" value={user.subscription.payment_status} update={(v)=>update("subscription.payment_status", v)} />
        <Field label="Expires At" value={user.subscription.expires_at} update={(v)=>update("subscription.expires_at", Number(v))} />

      </section>

      {/* ======================================================
         BONUS
      ====================================================== */}
      <section className="admin-card p-6 space-y-4">
        <h2 className="admin-title text-xl">Bonus</h2>

        <Field label="Award" value={user.bonus?.award} update={(v)=>update("bonus.award", v)} />
        <Field label="Expires" value={user.bonus?.expiresAt} update={(v)=>update("bonus.expiresAt", Number(v))} />

      </section>

      {/* ======================================================
         DELETE USER
      ====================================================== */}
      <div className="admin-card p-6">
        <button
          className="admin-btn admin-btn-danger"
          onClick={async () => {
            if (!confirm("Confermi l'eliminazione DEFINITIVA di questo utente?")) return;

            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/admin/user/update`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  token,
                  id: user.id,
                  field: "delete"
                }),
              }
            );

            const data = await res.json();

            if (data.deleted) {
              alert("Utente eliminato con successo.");
              window.location.href = `/admin/users?token=${token}`;
            } else {
              alert("Errore durante l'eliminazione.");
            }
          }}
        >
          Delete User
        </button>
      </div>

    </div>
  );
}

/* ============================================================================
   Reusable field component
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
