// ============================================================================
// AGW WORKER — BACKEND UFFICIALE
// Admin API + routing principale
// Tutte le API user vengono gestite da userRoutes
// ============================================================================

import { cors } from "./core/cors.js";
import { json } from "./core/response.js";

import { userRoutes } from "./user/route.js";
import { deepMerge } from "./core/deepMerge.js";
import { getUser } from "./user/repo/getUser.js";
import { saveUser } from "./user/repo/saveUser.js";
import { deleteUser } from "./user/logic/deleteUser.js";

// ADMIN MODULES
import { loginAdmin } from "./admin/loginAdmin.js";
import { logoutAdmin } from "./admin/logoutAdminSession.js";
import { verifyAdminSession } from "./admin/verifyAdminSession.js";

// ============================================================================
// MAIN ROUTER
// ============================================================================

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const method = request.method;

      // 1) USER ROUTES
      const userResult = userRoutes(url, method, request, env);
      if (userResult) return userResult;

      // 2) CORS preflight
      if (method === "OPTIONS") {
        return new Response(null, { status: 204, headers: cors() });
      }

      // ======================================================================
      // =============================  ADMIN  =================================
      // ======================================================================

      // LOGIN ADMIN
      if (url.pathname === "/api/admin/login" && method === "POST") {
        const { email, password } = await request.json();

        const result = await loginAdmin(env, email, password);

        if (!result.ok) {
          return json(result, result.status ?? 400);
        }

        return json({
          ok: true,
          sessionId: result.sessionId,
          admin: result.admin
        });
      }

      // LOGOUT ADMIN
      if (url.pathname === "/api/admin/logout" && method === "POST") {
        const { sessionId } = await request.json();
        await logoutAdmin(env, sessionId);
        return json({ ok: true });
      }

      // SESSION CHECK
      if (url.pathname === "/api/admin/me" && method === "POST") {
        const { sessionId } = await request.json();
        const session = await verifyAdminSession(env, sessionId);
        return json({ ok: !!session, session });
      }

      // ADMIN AUTH GUARD
      async function requireAdminSession() {
        const { sessionId } = await request.json();
        const session = await verifyAdminSession(env, sessionId);
        if (!session) return null;
        return session;
      }

      // ADMIN: Overview
      if (url.pathname === "/api/admin/overview" && method === "POST") {
        const body = await request.json();
        const session = await verifyAdminSession(env, body.sessionId);
        if (!session) return json({ error: "Unauthorized" }, 403);

        const { keys } = await env.AGW_USERS.list({ prefix: "user:" });

        let totalUsers = 0;
        let subs = 0;
        let bonuses = 0;
        let krm = 0;
        let day = 0;
        let missions = 0;

        for (const k of keys) {
          if (k.name === "user:index") continue;

          const raw = await env.AGW_USERS.get(k.name);
          if (!raw) continue;

          const user = JSON.parse(raw);
          totalUsers++;
          if (user.subscription?.type) subs++;
          if (user.bonus?.award) bonuses++;
          krm += user.stats?.krm_total ?? 0;
          missions += user.stats?.missions_completed_total ?? 0;
          day += user.stats?.dayPurchasesLast7Days ?? 0;
        }

        return json({
          totalUsers,
          activeSubscriptions: subs,
          activeBonuses: bonuses,
          totalKRM: krm,
          totalDay: day,
          totalMissions: missions
        });
      }

      // ADMIN: List Users
      if (url.pathname === "/api/admin/users/list" && method === "POST") {
        const body = await request.json();
        const session = await verifyAdminSession(env, body.sessionId);
        if (!session) return json({ error: "Unauthorized" }, 403);

        const { keys } = await env.AGW_USERS.list({ prefix: "user:" });
        const users = [];

        for (const k of keys) {
          if (k.name === "user:index") continue;

          const raw = await env.AGW_USERS.get(k.name);
          if (!raw) continue;

          try {
            const user = JSON.parse(raw);
            if (user?.id) users.push(user);
          } catch {}
        }

        return json({ users });
      }

      // ADMIN: Create User
      if (url.pathname === "/api/admin/user/create" && method === "POST") {
        const body = await request.json();
        const session = await verifyAdminSession(env, body.sessionId);
        if (!session) return json({ error: "Unauthorized" }, 403);

        let index = Number(await env.AGW_USERS.get("user:index") || 0);
        index++;
        await env.AGW_USERS.put("user:index", String(index));

        const id = crypto.randomUUID();
        const user = {
          id,
          index,
          nickname: `user${index}`,
          firstname: `name${index}`,
          lastname: `lastname${index}`,
          email: `name${index}.lastname${index}@mail.com`,
          password: "_" + index,
          stats: { level_total: 1 }
        };

        await env.AGW_USERS.put(`user:${id}`, JSON.stringify(user));

        return json(user);
      }

      // ADMIN: Update User
      if (url.pathname === "/api/admin/user/update" && method === "POST") {
        const body = await request.json();
        const session = await verifyAdminSession(env, body.sessionId);
        if (!session) return json({ error: "Unauthorized" }, 403);

        const { id, field, value } = body;
        const user = await getUser(env, id);

        if (!user) return json({ error: "User not found" }, 404);

        if (field === "delete") {
          return deleteUser(env, id);
        }

        if (field === "krm") user.stats.krm_total = Number(value);
        if (field === "level") user.stats.level_total = Number(value);
        if (field === "suspend") user.status.suspended = true;
        if (field === "unsuspend") user.status.suspended = false;

        await saveUser(env, id, user);
        return json(user);
      }

      // ======================================================================
      // FALLBACK 404
      // ======================================================================
      return new Response("Not found", {
        status: 404,
        headers: cors()
      });

    } catch (err) {
      return json({ error: "Internal Error", detail: err?.message }, 500);
    }
  }
};
