// ============================================================================
// AGW WORKER — BACKEND UFFICIALE
// Sintassi: Module Worker (A)
// Helpers: A2 (avanzati con auto-schema update + logging interno)
// ============================================================================
import { loginUser } from "./user/logic/loginUser.js";
import { deleteUser} from "./user/logic/deleteUser.js";
import { getUser } from "./user/repo/getUser.js";
import { saveUser } from "./user/repo/saveUser.js";
import { cors } from "./core/cors.js";
import { json } from "./core/response.js";
import { userRoutes } from "./user/route.js";


// ============================================================================
// USER DEFAULT MODEL (AGW_USER v2.0)
// ============================================================================
import { createDefaultUser } from "./user/model/defaultUser.js";
import { normalizeUserProfile } from "./user/model/normalizeUser.js";
import { deepMerge } from "./core/deepMerge.js";


export default {
  async fetch(request, env, ctx) {
    try {

      const url = new URL(request.url);
      const method = request.method;
     
      const userResult = userRoutes(url, method, request, env);
      if (userResult) return userResult;
    

      // ------------------------------
      // CORS
      // ------------------------------
      if (method === "OPTIONS") {
        return new Response(null, { status: 204, headers: cors() });
      }

      // ======================================================================
      // USER API
      // ======================================================================
        // ----------------------------------------------------
        // ======================================================================
// ADMIN: CLEAN USERS (Safe KV Repair Tool)
// POST /api/admin/clean-users
// ======================================================================
if (url.pathname === "/api/admin/clean-users" && method === "POST") {
  const { token } = await request.json();
  if (token !== env.ADMIN_TOKEN) return json({ error: "Forbidden" }, 403);

  const { keys } = await env.AGW_USERS.list({ prefix: "user:" });

  let repaired = 0;
  let skipped = 0;

  for (const k of keys) {

    // Skip system index
    if (k.name === "user:index") {
      skipped++;
      continue;
    }

    const raw = await env.AGW_USERS.get(k.name);
    if (!raw) continue;

    let user;
    try {
      user = JSON.parse(raw);
    } catch {
      continue;
    }

    if (!user || typeof user !== "object") {
      skipped++;
      continue;
    }

    // REPAIR: ensure id exists
    if (!user.id) {
      user.id = k.name.replace("user:", "");
    }

    // Apply default schema
    user = normalizeUserProfile(user);

    // Guarantee bonus object exists
    if (user.bonus === null) {
      user.bonus = { award: null, expiresAt: null };
    }

    // Guarantee missions exists
    if (!Array.isArray(user.missions)) {
      user.missions = [];
    }

    // Save repaired version
    await env.AGW_USERS.put(k.name, JSON.stringify(user));
    repaired++;
  }

  return json({
    ok: true,
    repaired,
    skipped,
    total: repaired + skipped
  });
}
// ----------------------------------------------------
// ADMIN: CREATE USER
// POST /api/admin/user/create
// ----------------------------------------------------
if (url.pathname === "/api/admin/user/create" && method === "POST") {
  const body = await request.json();
  const token = body.token;

  if (!token || token !== env.ADMIN_TOKEN) {
    return json({ error: "Forbidden" }, 403);
  }

  // USER INDEX
  let indexRaw = await env.AGW_USERS.get("user:index");
  let index = indexRaw ? Number(indexRaw) : 0;
  index++;

  await env.AGW_USERS.put("user:index", String(index));

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

    // ======================================================================
// ADMIN: SAVE FULL USER
// POST /api/admin/user/save
// ======================================================================
if (url.pathname === "/api/admin/user/save" && method === "POST") {
  const { token, id, userData } = await request.json();

  if (token !== env.ADMIN_TOKEN)
    return json({ error: "Forbidden" }, 403);

  let user = await getUser(env, id);
  if (!user)
    return json({ error: "User not found" }, 404);

  // Merge completo del profilo
  user = deepMerge(user, userData);

  await saveUser(env, id, user);
  await log(env, "admin_full_save", { id });

  return json({ ok: true, user });
}

  // -----------------------------------------
      // POST /api/user/get
      // -----------------------------------------
      if (url.pathname === "/api/user/get" && method === "POST") {
        const { id } = await request.json();

        if (!id) return json({ error: "Missing user id" }, 400);

        const user = await getUser(env, id);
        if (!user) return json({ error: "User not found" }, 404);

        return json(user);
      }

      // -----------------------------------------
      // POST /api/user/add-day
      // -----------------------------------------
      if (url.pathname === "/api/user/add-day" && method === "POST") {
        const { id } = await request.json();

        const user = await getUser(env, id);
        if (!user) return json({ error: "User not found" }, 404);

        user.stats.dayPurchasesLast7Days++;

        const daily = user.stats.dayPurchasesLast7Days;
        const bonus = evaluateWeeklyBonus(daily);

        if (bonus.award) {
          user.bonus = bonus;

          user.subscription = {
            type: bonus.award,
            expiresAt: bonus.expiresAt
          };
        }

        await saveUser(env, id, user);
        await log(env, "user_add_day", { id, daily });

        return json(user);
      }

      // -----------------------------------------
      // POST /api/user/apply-bonus
      // -----------------------------------------
      if (url.pathname === "/api/user/apply-bonus" && method === "POST") {
        const { id, dailyCount } = await request.json();

        const user = await getUser(env, id);
        if (!user) return json({ error: "User not found" }, 404);

        const bonus = evaluateWeeklyBonus(Number(dailyCount));

        user.bonus = bonus;

        if (bonus.award) {
          user.subscription = {
            type: bonus.award,
            expiresAt: bonus.expiresAt
          };
        }

        user.stats.dayPurchasesLast7Days = Number(dailyCount);

        await saveUser(env, id, user);
        await log(env, "user_apply_bonus", { id, bonus });

        return json(user);
      }

      // ======================================================================
      // MAILING API
      // ======================================================================

      if (url.pathname === "/api/user/mailing/update" && method === "POST") {
        const { id, field, value } = await request.json();

        const user = await getUser(env, id);
        if (!user) return json({ error: "User not found" }, 404);

        // preferences.newsletter → path: ['preferences', 'newsletter']
        if (field.startsWith("preferences.")) {
          const key = field.split(".")[1];
          user.mailing.preferences[key] = Boolean(value);
        }

        if (field === "primary") user.mailing.primary = value;
        if (field === "secondary") user.mailing.secondary = value;

        if (field === "unsubscribe") {
          user.mailing.status.unsubscribe = true;
          user.mailing.status.unsubscribe_at = Date.now();
        }

        await saveUser(env, id, user);
        await log(env, "mailing_update", { id, field, value });

        return json(user);
      }

      if (url.pathname === "/api/user/mailing/verify" && method === "POST") {
        const { id } = await request.json();

        const user = await getUser(env, id);
        if (!user) return json({ error: "User not found" }, 404);

        const token = crypto.randomUUID();
        user.mailing.verification_sent_at = Date.now();
        user.mailing._verification_token = token;

        await saveUser(env, id, user);
        await log(env, "mailing_verify", { id, token });

        return json({
          ok: true,
          verify_url: `https://agw.app/verify-email?token=${token}`
        });
      }

      // ======================================================================
      // ADMIN API
      // ======================================================================

      if (url.pathname === "/api/admin/verify" && method === "POST") {
        const { token } = await request.json();
        return json({ valid: token === env.ADMIN_TOKEN });
      }

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
          const raw = await env.AGW_USERS.get(k.name);
          if (!raw) continue;

          const user = JSON.parse(raw);
          totalUsers++;

          if (user?.subscription?.type) subs++;
          if (user?.bonus?.award) bonuses++;
          krm += user?.stats?.krm ?? 0;
          day += user?.stats?.dayPurchasesLast7Days ?? 0;
          missions += user?.stats?.missionsCompleted ?? 0;
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

      if (url.pathname === "/api/admin/users/list") {
        const token = request.headers.get("x-admin-token");
        if (token !== env.ADMIN_TOKEN) return json({ error: "Forbidden" }, 403);
      
        const { keys } = await env.AGW_USERS.list({ prefix: "user:" });
      
        const users = [];
        for (const k of keys) {
      
          // IGNORA user:index
          if (k.name === "user:index") continue;
      
          const raw = await env.AGW_USERS.get(k.name);
          if (!raw) continue;
      
          let user;
          try {
            user = JSON.parse(raw);
          } catch {
            continue;
          }
      
          // deve essere un profilo vero
          if (!user || typeof user !== "object" || !user.id) continue;
      
          users.push(user);
        }
      
        return json({ users });
      }
      
    
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
        await log(env, "admin_update", { id, field, value });

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
      return json({ error: "Internal Error", detail: err.message }, 500);
    }
  }
};


/*async function getUser(env, id) {
  const raw = await env.AGW_USERS.get(`user:${id}`);
  if (!raw) return null;

  let user = JSON.parse(raw);

  // auto-schema update
  user = normalizeUserProfile(user);

  return user;
}

async function saveUser(env, id, user) {
  await env.AGW_USERS.put(`user:${id}`, JSON.stringify(user));
}
*/
// --------------------------------------------
// LOGGING
// --------------------------------------------
async function log(env, type, data) {
  const timestamp = Date.now();
  const key = `log:${timestamp}:${crypto.randomUUID()}`;

  await env.AGW_LOGS.put(
    key,
    JSON.stringify({
      type,
      timestamp,
      ...data
    })
  );
}