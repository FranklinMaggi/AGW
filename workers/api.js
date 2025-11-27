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
import { evaluateWeeklyBonus } from "./user/logic/evaluateWeeklyBonus.js";

// ============================================================================
// MAIN ROUTER
// ============================================================================
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const method = request.method;

      // 1) USER ROUTES → delega completa
      const userResult = userRoutes(url, method, request, env);
      if (userResult) return userResult;

      // 2) CORS
      if (method === "OPTIONS") {
        return new Response(null, { status: 204, headers: cors() });
      }

      // ======================================================================
      // ADMIN ONLY ROUTES
      // ======================================================================

      // ADMIN: Verify Login
      if (url.pathname === "/api/admin/verify" && method === "POST") {
        const { token } = await request.json();
        return json({ valid: token === env.ADMIN_TOKEN });
      }

      // ADMIN: Overview
      if (url.pathname === "/api/admin/overview" && method === "POST") {
        const { token } = await request.json();
        if (token !== env.ADMIN_TOKEN) return json({ error: "Forbidden" }, 403);

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
      if (url.pathname === "/api/admin/users/list") {
        const token = request.headers.get("x-admin-token");
        if (token !== env.ADMIN_TOKEN) return json({ error: "Forbidden" }, 403);

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
        const { token } = await request.json();
        if (token !== env.ADMIN_TOKEN) return json({ error: "Forbidden" }, 403);

        // INDEX
        let index = Number(await env.AGW_USERS.get("user:index") || 0);
        index++;
        await env.AGW_USERS.put("user:index", String(index));

        // User generation
        const id = crypto.randomUUID();
        const nickname = `user${index}`;
        const firstname = `name${index}`;
        const lastname = `lastname${index}`;
        const email = `${firstname}.${lastname}@mail.com`;

        const user = {
          id,
          index,
          nickname,
          firstname,
          lastname,
          email,
          password: "_" + nickname,
          phone: null,

          profile_image: null,
          avatar_ai: null,

          mailing: {
            primary: email,
            secondary: null,
            verified: false,
            verification_sent_at: null,
            verified_at: null,
            preferences: {
              newsletter: true,
              missions: true,
              rewards: true,
              billing: true,
              security: true,
            },
            status: {
              bounced: false,
              soft_bounce_count: 0,
              hard_bounce: false,
              unsubscribe: false,
              unsubscribe_at: null,
            },
            log: [],
          },

          personal: {
            birthdate: null,
            weight: null,
            height: null,
            gender: null,
            job: null,
          },

          status: {
            suspended: false,
            createdAt: Date.now(),
          },

          stats: {
            level_total: 1,
            level_year: 1,
            rank_month: 1,
            motivation_week: 0,
            assessment_day: 0,
            krm_total: 0,
            krm_year: 0,
            krm_month: 0,
            krm_week: 0,
            krm_day: 0,
            missions_completed_total: 0,
            missions_completed_month: 0,
            missions_completed_week: 0,
            missions_completed_today: 0,
            dayPurchasesLast7Days: 0,
          },

          discipline: {
            daily_completed: 0,
            daily_goal: 3,
            weekly_completed: 0,
            weekly_goal: 7,
          },

          subscription: {
            type: null,
            renew_every: 30,
            last_payment_at: null,
            payment_status: null,
            expires_at: null,
          },

          bonus: null,
          missions: [],
        };

        await env.AGW_USERS.put(`user:${id}`, JSON.stringify(user));
        return json(user);
      }

      // ADMIN: Full Save User
      if (url.pathname === "/api/admin/user/save" && method === "POST") {
        const { token, id, userData } = await request.json();
        if (token !== env.ADMIN_TOKEN) return json({ error: "Forbidden" }, 403);

        let user = await getUser(env, id);
        if (!user) return json({ error: "User not found" }, 404);

        user = deepMerge(user, userData);
        await saveUser(env, id, user);

        return json({ ok: true, user });
      }

      // ADMIN: Update user (simple fields)
      if (url.pathname === "/api/admin/user/update" && method === "POST") {
        const { token, id, field, value } = await request.json();
        if (token !== env.ADMIN_TOKEN) return json({ error: "Forbidden" }, 403);

        const user = await getUser(env, id);
        if (!user) return json({ error: "User not found" }, 404);

        switch (field) {
          case "krm":
            user.stats.krm_total = Number(value);
            break;

          case "level":
            user.stats.level_total = Number(value);
            break;

          case "suspend":
            user.status.suspended = true;
            break;

          case "unsuspend":
            user.status.suspended = false;
            break;

          case "delete":
            return await deleteUser(env, id);

          default:
            return json({ error: "Invalid field" }, 400);
        }

        await saveUser(env, id, user);
        return json(user);
      }

      // ======================================================================
      // FALLBACK
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
