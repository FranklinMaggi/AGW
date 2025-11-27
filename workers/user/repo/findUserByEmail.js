export async function findUserByEmail(env, email) {
  // normalizza (trim + lowercase) tutto
  const norm = (v) => (v || "").trim().toLowerCase();

  const target = norm(email);
  if (!target) return null;

  const { keys } = await env.AGW_USERS.list({ prefix: "user:" });

  for (const k of keys) {
    if (k.name === "user:index") continue;

    const raw = await env.AGW_USERS.get(k.name);
    if (!raw) continue;

    let user;
    try {
      user = JSON.parse(raw);
    } catch {
      continue;
    }

    // match sia su user.email sia su mailing.primary
    if (
      norm(user.email) === target ||
      norm(user.mailing?.primary) === target
    ) {
      return user;
    }
  }

  return null;
}
