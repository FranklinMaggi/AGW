import { json } from "../core/json.js";
import { getAdmin } from "../services/admin.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { getUser, saveUser } from "../services/user.js";
import { createSession, verifySession } from "../services/session.js";

export async function adminRoutes(url, method, request, env) {

  // ADMIN LOGIN
  if (url.pathname === "/api/admin/login" && method === "POST") {
    const { email, password } = await request.json();
    const admin = await getAdmin(env, email);
    if (!admin) return json({ ok: false, error: "ADMIN_NOT_FOUND" }, 404);

    const ok = await verifyPassword(password, admin.password_hash, admin.password_salt);
    if (!ok) return json({ ok: false, error: "WRONG_PASSWORD" }, 401);

    const session = await createSession(env, admin.id, "admin");
    return json({ ok: true, sessionId: session.sessionId });
  }

  // ADMIN ME
  if (url.pathname === "/api/admin/me" && method === "POST") {
    const { sessionId } = await request.json();
    const session = await verifySession(env, sessionId);
    return json({ ok: !!session });
  }

  // OVERVIEW
  if (url.pathname === "/api/admin/overview" && method === "POST") {
    const { sessionId } = await request.json();
    const session = await verifySession(env, sessionId);
    if (!session) return json({ ok: false, error: "UNAUTHORIZED" }, 403);

    const { keys } = await env.AGW_USERS.list({ prefix: "user:" });

    let totalUsers = 0;
    let activeSubs = 0;

    for (const k of keys) {
      const raw = await env.AGW_USERS.get(k.name);
      if (!raw) continue;

      try {
        const user = JSON.parse(raw);
        if (user.id) totalUsers++;
        if (user.subscription?.type) activeSubs++;
      } catch {}
    }

    return json({ ok: true, totalUsers, activeSubs });
  }

  // USERS LIST
  if (url.pathname === "/api/admin/users/list" && method === "GET") {
    const sessionId = url.searchParams.get("sessionId");
    const session = await verifySession(env, sessionId);
    if (!session) return json({ ok: false, error: "UNAUTHORIZED" }, 403);

    const { keys } = await env.AGW_USERS.list({ prefix: "user:" });
    const users = [];

    for (const k of keys) {
      const raw = await env.AGW_USERS.get(k.name);
      if (!raw) continue;

      try {
        const user = JSON.parse(raw);
        users.push(user);
      } catch {}
    }

    return json({ ok: true, users });
  }

  // USER UPDATE
  if (url.pathname === "/api/admin/user/update" && method === "POST") {
    const { sessionId, id, field, value } = await request.json();
    const session = await verifySession(env, sessionId);
    if (!session) return json({ ok: false, error: "UNAUTHORIZED" }, 403);

    const user = await getUser(env, id);
    if (!user) return json({ ok: false, error: "USER_NOT_FOUND" }, 404);

    if (field === "delete") {
      await env.AGW_USERS.delete(`user:${id}`);
      return json({ ok: true, deleted: true });
    }

    user[field] = value;
    await saveUser(env, id, user);
    return json({ ok: true, user });
  }

  // USER SAVE (ADMIN)
  if (url.pathname === "/api/admin/user/save" && method === "POST") {
    const { sessionId, user } = await request.json();
    const session = await verifySession(env, sessionId);
    if (!session || session.role !== "admin") {
      return json({ ok: false, error: "UNAUTHORIZED" }, 403);
    }

    await saveUser(env, user.id, user);
    return json({ ok: true });
  }
  // ADMIN BOOTSTRAP (crea superadmin una sola volta)
if (url.pathname === "/api/admin/bootstrap" && method === "POST") {
  const { token, email, password } = await request.json();

  // protezione semplice
  if (token !== env.ADMIN_TOKEN) {
    return json({ ok: false, error: "FORBIDDEN" }, 403);
  }

  const existing = await getAdmin(env, email);
  if (existing) {
    return json({ ok: false, error: "ADMIN_ALREADY_EXISTS" }, 409);
  }

  const { hash, salt } = await hashPassword(password);

  const admin = {
    id: crypto.randomUUID(),
    email,
    password_hash: hash,
    password_salt: salt,
    role: "admin",
    createdAt: Date.now()
  };

  await env.AGW_ADMIN.put(`admin:${admin.id}`, JSON.stringify(admin));

  return json({ ok: true, admin });
}
  return null;
}
