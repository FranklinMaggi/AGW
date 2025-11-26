var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-AcEI3A/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// workers/core/cors.js
function cors(type = "application/json") {
  return {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-token"
  };
}
__name(cors, "cors");

// workers/core/response.js
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: cors("application/json")
  });
}
__name(json, "json");

// workers/user/logic/deleteUser.js
async function deleteUser(env, id) {
  if (!id) return json({ error: "Missing id" }, 400);
  await env.AGW_USERS.delete(`user:${id}`);
  return json({ deleted: true });
}
__name(deleteUser, "deleteUser");

// workers/user/repo/getUser.js
async function getUser(env, id) {
  const raw = await env.AGW_USERS.get(`user:${id}`);
  return raw ? JSON.parse(raw) : null;
}
__name(getUser, "getUser");

// workers/user/repo/saveUser.js
async function saveUser(env, id, user) {
  await env.AGW_USERS.put(`user:${id}`, JSON.stringify(user));
}
__name(saveUser, "saveUser");

// workers/user/model/defaultUser.js
function createDefaultUser(id) {
  return {
    id,
    nickname: "",
    firstname: "",
    lastname: "",
    email: "",
    profile_image: null,
    avatar_ai: null,
    mailing: {
      primary: "",
      secondary: null,
      verified: false,
      verification_sent_at: null,
      verified_at: null,
      preferences: {
        newsletter: true,
        missions: true,
        rewards: true,
        billing: true,
        security: true
      },
      status: {
        bounced: false,
        soft_bounce_count: 0,
        hard_bounce: false,
        unsubscribe: false,
        unsubscribe_at: null
      },
      log: []
    },
    personal: {
      birthdate: null,
      weight: null,
      height: null,
      gender: null,
      job: null
    },
    status: {
      suspended: false,
      createdAt: Date.now()
    },
    stats: {
      level_total: 1,
      level_year: 1,
      rank_month: 0,
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
      dayPurchasesLast7Days: 0
    },
    discipline: {
      daily_completed: 0,
      daily_goal: 3,
      weekly_completed: 0,
      weekly_goal: 7
    },
    subscription: {
      type: null,
      renew_every: null,
      last_payment_at: null,
      payment_status: null,
      expires_at: null
    },
    bonus: null
  };
}
__name(createDefaultUser, "createDefaultUser");

// workers/user/repo/findUserByEmail.js
async function findUserByEmail(env, email) {
  const { keys } = await env.AGW_USERS.list({ prefix: "user:" });
  for (const k of keys) {
    if (k.name === "user:index") continue;
    const raw = await env.AGW_USERS.get(k.name);
    if (!raw) continue;
    const user = JSON.parse(raw);
    if (user.email === email) return user;
  }
  return null;
}
__name(findUserByEmail, "findUserByEmail");

// workers/user/logic/registerUser.js
async function registerUserHandler(request, env) {
  const body = await request.json();
  const { email, firstname, lastname, password } = body;
  if (!email) return json({ error: "Missing email" }, 400);
  if (!password) return json({ error: "Missing password" }, 400);
  const existing = await findUserByEmail(env, email);
  if (existing) return json({ error: "Email already registered" }, 409);
  const id = crypto.randomUUID();
  const user = createDefaultUser(id);
  user.email = email;
  user.mailing.primary = email;
  user.firstname = firstname || "";
  user.lastname = lastname || "";
  user.password = password;
  await saveUser(env, id, user);
  return json({ ok: true, user });
}
__name(registerUserHandler, "registerUserHandler");

// workers/user/route.js
function userRoutes(url, method, request, env) {
  if (url.pathname === "/api/user/register" && method === "POST") {
    return registerUserHandler(request, env);
  }
  if (url.pathname === "/api/admin/user/delete" && method === "POST") {
    return deleteUser(request, env);
  }
  return null;
}
__name(userRoutes, "userRoutes");

// workers/core/deepMerge.js
function deepMerge(base, update) {
  for (const k in update) {
    if (typeof base[k] === "object" && base[k] !== null && typeof update[k] === "object" && update[k] !== null && !Array.isArray(base[k])) {
      deepMerge(base[k], update[k]);
    } else {
      base[k] = update[k];
    }
  }
  return base;
}
__name(deepMerge, "deepMerge");

// workers/user/model/normalizeUser.js
function normalizeUserProfile(u) {
  const base = createDefaultUser(u.id || "unknown");
  return deepMerge(base, u);
}
__name(normalizeUserProfile, "normalizeUserProfile");

// workers/api.js
var api_default = {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const method = request.method;
      const userResult = userRoutes(url, method, request, env);
      if (userResult) return userResult;
      if (method === "OPTIONS") {
        return new Response(null, { status: 204, headers: cors() });
      }
      if (url.pathname === "/api/admin/clean-users" && method === "POST") {
        const { token } = await request.json();
        if (token !== env.ADMIN_TOKEN) return json({ error: "Forbidden" }, 403);
        const { keys } = await env.AGW_USERS.list({ prefix: "user:" });
        let repaired = 0;
        let skipped = 0;
        for (const k of keys) {
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
          if (!user.id) {
            user.id = k.name.replace("user:", "");
          }
          user = normalizeUserProfile(user);
          if (user.bonus === null) {
            user.bonus = { award: null, expiresAt: null };
          }
          if (!Array.isArray(user.missions)) {
            user.missions = [];
          }
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
      if (url.pathname === "/api/admin/user/create" && method === "POST") {
        const body = await request.json();
        const token = body.token;
        if (!token || token !== env.ADMIN_TOKEN) {
          return json({ error: "Forbidden" }, 403);
        }
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
              security: true
            },
            status: {
              bounced: false,
              soft_bounce_count: 0,
              hard_bounce: false,
              unsubscribe: false,
              unsubscribe_at: null
            },
            log: []
          },
          personal: {
            birthdate: null,
            weight: null,
            height: null,
            gender: null,
            job: null
          },
          status: {
            suspended: false,
            createdAt: Date.now()
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
            missions_completed_today: 0
          },
          discipline: {
            daily_completed: 0,
            daily_goal: 3,
            weekly_completed: 0,
            weekly_goal: 7
          },
          subscription: {
            type: null,
            renew_every: 30,
            last_payment_at: null,
            payment_status: null,
            expires_at: null
          },
          bonus: null,
          missions: []
        };
        await env.AGW_USERS.put(`user:${id}`, JSON.stringify(user));
        return json(user);
      }
      if (url.pathname === "/api/admin/user/save" && method === "POST") {
        const { token, id, userData } = await request.json();
        if (token !== env.ADMIN_TOKEN)
          return json({ error: "Forbidden" }, 403);
        let user = await getUser(env, id);
        if (!user)
          return json({ error: "User not found" }, 404);
        user = deepMerge(user, userData);
        await saveUser(env, id, user);
        await log(env, "admin_full_save", { id });
        return json({ ok: true, user });
      }
      if (url.pathname === "/api/user/get" && method === "POST") {
        const { id } = await request.json();
        if (!id) return json({ error: "Missing user id" }, 400);
        const user = await getUser(env, id);
        if (!user) return json({ error: "User not found" }, 404);
        return json(user);
      }
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
      if (url.pathname === "/api/user/mailing/update" && method === "POST") {
        const { id, field, value } = await request.json();
        const user = await getUser(env, id);
        if (!user) return json({ error: "User not found" }, 404);
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
          if (k.name === "user:index") continue;
          const raw = await env.AGW_USERS.get(k.name);
          if (!raw) continue;
          let user;
          try {
            user = JSON.parse(raw);
          } catch {
            continue;
          }
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
      return new Response("Not found", {
        status: 404,
        headers: cors()
      });
    } catch (err) {
      return json({ error: "Internal Error", detail: err.message }, 500);
    }
  }
};
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
__name(log, "log");
function evaluateWeeklyBonus(dailyCount) {
  if (dailyCount >= 15)
    return {
      award: "ADVANCED",
      days: 30,
      expiresAt: Date.now() + 30 * 864e5
    };
  if (dailyCount >= 8)
    return {
      award: "COMFORT",
      days: 30,
      expiresAt: Date.now() + 30 * 864e5
    };
  if (dailyCount >= 5)
    return {
      award: "BASIC",
      days: 30,
      expiresAt: Date.now() + 30 * 864e5
    };
  return {
    award: null,
    days: 0,
    expiresAt: null
  };
}
__name(evaluateWeeklyBonus, "evaluateWeeklyBonus");

// ../../../../../.nvm/versions/node/v22.18.0/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// .wrangler/tmp/bundle-AcEI3A/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default
];
var middleware_insertion_facade_default = api_default;

// ../../../../../.nvm/versions/node/v22.18.0/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-AcEI3A/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=api.js.map
