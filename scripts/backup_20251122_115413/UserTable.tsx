"use client";

import Image from "next/image";
import { useState } from "react";

function formatDate(timestamp?: number | null): string {
  if (!timestamp || Number.isNaN(timestamp)) return "—";
  try {
    return new Date(timestamp).toLocaleDateString("it-IT");
  } catch {
    return "—";
  }
}

export default function UserTable({ users, token }: { users: any[]; token: string }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  // ===========================================================
  // ADMIN TOKEN REQUIRED
  // ===========================================================
  if (!token) {
    return (
      <div className="admin-card p-6 text-red-500 font-bold">
        ERRORE: Token amministratore mancante.
        <br />
        Accedi tramite /admin/login oppure apri:  
        <br />
        /admin/users?token=IL_TUO_TOKEN
      </div>
    );
  }

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map((u) => u.id));
    }
  }

  const safeUsers = Array.isArray(users) ? users : [];

  function safeLower(v: any) {
    if (!v) return "";
    return String(v).toLowerCase();
  }

  const filtered = safeUsers.filter((u) => {
    const term = search.toLowerCase();

    return (
      safeLower(u.id).includes(term) ||
      safeLower(u.nickname).includes(term) ||
      safeLower(u.firstname).includes(term) ||
      safeLower(u.lastname).includes(term) ||
      safeLower(u.email).includes(term) ||
      safeLower(u.subscription?.type).includes(term) ||
      safeLower(u.bonus?.award).includes(term)
    );
  });

  // ===========================================================
  // DELETE MULTIPLA: FIX TOKEN
  // ===========================================================
  async function handleBulkDelete() {
    if (!confirm(`Eliminare definitivamente ${selected.length} utenti?`)) return;

    for (const id of selected) {
      await fetch("${NEXT_PUBLIC_API_URL}/api/admin/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token
        },
        body: JSON.stringify({
          token,
          id,
          field: "delete",
        }),
      });
    }

    alert("Utenti eliminati correttamente.");
    window.location.reload();
  }

  return (
    <div className="admin-card p-4 space-y-4 overflow-auto">
      <input
        className="admin-input"
        placeholder="Search user (id, name, email, subscription...)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {selected.length > 0 && (
        <button
          onClick={handleBulkDelete}
          className="admin-btn admin-btn-danger"
        >
          Delete Selected ({selected.length})
        </button>
      )}

      <div className="overflow-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-[var(--admin-surface-light)]">
            <tr>
              <Th>
                <input
                  type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                />
              </Th>

              <Th>Avatar</Th>
              <Th>Edit</Th>
              <Th>Delete</Th>

              <Th>ID</Th>
              <Th>Nickname</Th>
              <Th>Name</Th>
              <Th>Email</Th>

              <Th>Birth</Th>
              <Th>Gender</Th>
              <Th>Height</Th>
              <Th>Weight</Th>
              <Th>Job</Th>

              <Th>Status</Th>
              <Th>Created</Th>

              <Th>Level</Th>
              <Th>Level Y</Th>
              <Th>Rank M</Th>
              <Th>Mot W</Th>
              <Th>Ass D</Th>

              <Th>KRM Tot</Th>
              <Th>KRM Y</Th>
              <Th>KRM M</Th>
              <Th>KRM W</Th>
              <Th>KRM D</Th>

              <Th>Subscription</Th>
              <Th>Pay Status</Th>
              <Th>Payment Date</Th>
              <Th>Expires</Th>

              <Th>Bonus</Th>
              <Th>Bonus Exp</Th>

              <Th>Daily</Th>
              <Th>Weekly</Th>

              <Th>Missions Tot</Th>
              <Th>Missions M</Th>
              <Th>Missions W</Th>
              <Th>Missions T</Th>
              <Th>Last MS</Th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((user) => (
              <tr
                key={String(user.id || user.index)}
                className="border-b border-[var(--admin-border)]"
              >
                <Td>
                  <input
                    type="checkbox"
                    checked={selected.includes(user.id)}
                    onChange={() => toggle(user.id)}
                  />
                </Td>

                <Td>
                  <AvatarCell user={user} />
                </Td>

                <Td>
                  <a
                    href={`/admin/users/${user.id}/edit?token=${token}`}
                    className="admin-btn admin-btn-blue text-xs"
                  >
                    Edit
                  </a>
                </Td>

                {/* ===========================================================
                    DELETE SINGOLA: FIX TOKEN
                ============================================================ */}
                <Td>
                  <button
                    onClick={async () => {
                      if (
                        !confirm(
                          `Eliminare definitivamente l'utente ${user.nickname}?`
                        )
                      )
                        return;

                      const res = await fetch(
                        "${NEXT_PUBLIC_API_URL}/api/admin/user/update",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "x-admin-token": token
                          },
                          body: JSON.stringify({
                            token,
                            id: user.id,
                            field: "delete",
                          }),
                        }
                      );

                      const data = await res.json();

                      if (data.deleted) {
                        alert("Utente eliminato.");
                        window.location.reload();
                      } else {
                        alert("Errore eliminazione: " + (data.error ?? ""));
                      }
                    }}
                    className="admin-btn admin-btn-danger text-xs"
                  >
                    Delete
                  </button>
                </Td>

                <Td>{user.id}</Td>
                <Td>{user.nickname}</Td>
                <Td>
                  {user.firstname} {user.lastname}
                </Td>
                <Td>{user.mailing?.primary}</Td>

                <Td>{user.personal?.birthdate}</Td>
                <Td>{user.personal?.gender}</Td>
                <Td>{user.personal?.height}</Td>
                <Td>{user.personal?.weight}</Td>
                <Td>{user.personal?.job}</Td>

                <Td>{user.status?.suspended ? "Suspended" : "Active"}</Td>
                <Td>
                  {new Date(user.status?.createdAt).toLocaleDateString()}
                </Td>

                <Td>{user.stats?.level_total}</Td>
                <Td>{user.stats?.level_year}</Td>
                <Td>{user.stats?.rank_month}</Td>
                <Td>{user.stats?.motivation_week}</Td>
                <Td>{user.stats?.assessment_day}</Td>

                <Td>{user.stats?.krm_total}</Td>
                <Td>{user.stats?.krm_year}</Td>
                <Td>{user.stats?.krm_month}</Td>
                <Td>{user.stats?.krm_week}</Td>
                <Td>{user.stats?.krm_day}</Td>

                <Td>{user.subscription?.type}</Td>
                <Td>
                  <PaymentStatus status={user.subscription?.payment_status} />
                </Td>
                <Td>{formatDate(user.subscription?.last_payment_at)}</Td>
                <Td>{formatDate(user.subscription?.expires_at)}</Td>

                <Td>{user.bonus?.award}</Td>
                <Td>{formatDate(user.bonus?.expiresAt)}</Td>

                <Td>
                  {user.discipline?.daily_completed}/
                  {user.discipline?.daily_goal}
                </Td>
                <Td>
                  {user.discipline?.weekly_completed}/
                  {user.discipline?.weekly_goal}
                </Td>

                <Td>{user.stats?.missions_completed_total}</Td>
                <Td>{user.stats?.missions_completed_month}</Td>
                <Td>{user.stats?.missions_completed_week}</Td>
                <Td>{user.stats?.missions_completed_today}</Td>
                <Td>
                  <MissionStatus missions={user.missions} />
                </Td>
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

function AvatarCell({ user }: any) {
  const src = user.profile_image || user.avatar_ai || "/default-avatar.png";

  return (
    <img
      src={src}
      className="w-10 h-10 rounded-full object-cover border border-[var(--admin-border)]"
    />
  );
}

const VALID_STATUSES = ["green", "orange", "red"] as const;
type PaymentStatusType = typeof VALID_STATUSES[number];

export function PaymentStatus({ status }: { status: string }) {
  const colorMap: Record<PaymentStatusType, string> = {
    green: "text-green-400",
    orange: "text-orange-400",
    red: "text-red-400",
  };

  const valid = (VALID_STATUSES as readonly string[]).includes(status);
  const color = valid ? colorMap[status as PaymentStatusType] : "text-neutral-400";

  return <span className={color}>{status}</span>;
}

export function MissionStatus({ missions }: { missions: any[] }) {
  if (!missions || missions.length === 0) {
    return <span className="text-neutral-400">—</span>;
  }

  const last = missions[missions.length - 1].status as string;

  const colors: Record<string, string> = {
    approved: "text-green-400",
    pending: "text-orange-400",
    rejected: "text-red-400",
  };

  return (
    <span className={colors[last] ?? "text-neutral-400"}>
      {last}
    </span>
  );
}
