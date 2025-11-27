import { registerUserHandler } from "./logic/registerUser.js";
import { loginUser } from "./logic/loginUser.js";
import { deleteUser } from "./logic/deleteUser.js";
import { getUser } from "./repo/getUser.js";
import { saveUser } from "./repo/saveUser.js";
import { requestPasswordReset } from "./logic/requestPasswordReset.js";
import { resetPassword } from "./logic/resetPassword.js";
import { evaluateWeeklyBonus } from "./logic/evaluateWeeklyBonus.js";
import { json } from "../core/response.js";

// ============================================================================
// USER ROUTER
// ============================================================================
export function userRoutes(url, method, request, env) {

  // --------------------------------------------------------------------------
  // AUTH ALIAS (Next.js usa /api/auth/register)
  // --------------------------------------------------------------------------
  if (url.pathname === "/api/auth/register" && method === "POST") {
    return registerUserHandler(request, env);
  }

  // --------------------------------------------------------------------------
  // LOGIN
  // --------------------------------------------------------------------------
  if (url.pathname === "/api/user/login" && method === "POST") {
    return (async () => {
      const body = await request.json();
      const result = await loginUser(env, body);
      const status = result?.status ?? (result.error ? 400 : 200);
      return json(result, status);
    })();
  }

  // --------------------------------------------------------------------------
  // REGISTER (public)
  // --------------------------------------------------------------------------
  if (url.pathname === "/api/user/register" && method === "POST") {
    return registerUserHandler(request, env);
  }

  // --------------------------------------------------------------------------
  // REQUEST RESET PASSWORD
  // --------------------------------------------------------------------------
  if (url.pathname === "/api/user/request-password-reset" && method === "POST") {
    return (async () => {
      const { email } = await request.json();
      const result = await requestPasswordReset(env, email);
      return json(result);
    })();
  }

  // --------------------------------------------------------------------------
  // DO RESET PASSWORD
  // --------------------------------------------------------------------------
  if (url.pathname === "/api/user/reset-password" && method === "POST") {
    return (async () => {
      const { token, new_password } = await request.json();
      const result = await resetPassword(env, token, new_password);
      return json(result, result.ok ? 200 : 400);
    })();
  }

  // --------------------------------------------------------------------------
  // GET USER
  // --------------------------------------------------------------------------
  if (url.pathname === "/api/user/get" && method === "POST") {
    return (async () => {
      const { id } = await request.json();
      if (!id) return json({ error: "Missing user id" }, 400);

      const user = await getUser(env, id);
      if (!user) return json({ error: "User not found" }, 404);

      return json(user);
    })();
  }

  // --------------------------------------------------------------------------
  // UPDATE PROFILE
  // --------------------------------------------------------------------------
  if (url.pathname === "/api/user/update-profile" && method === "POST") {
    return (async () => {
      const { userId, data } = await request.json();
      if (!userId) return json({ error: "Missing userId" }, 400);

      const user = await getUser(env, userId);
      if (!user) return json({ error: "Not found" }, 404);

      user.firstname = data.firstname ?? user.firstname;
      user.lastname = data.lastname ?? user.lastname;
      user.nickname = data.nickname ?? user.nickname;

      user.personal = { ...user.personal, ...data.personal };

      await saveUser(env, userId, user);
      return json({ ok: true, user });
    })();
  }

  // --------------------------------------------------------------------------
  // UPDATE EMAIL PREFS
  // --------------------------------------------------------------------------
  if (url.pathname === "/api/user/update-email-prefs" && method === "POST") {
    return (async () => {
      const { userId, prefs } = await request.json();

      const user = await getUser(env, userId);
      if (!user) return json({ error: "Not found" }, 404);

      user.mailing.preferences = { ...user.mailing.preferences, ...prefs };

      await saveUser(env, userId, user);
      return json({ ok: true, user });
    })();
  }

  // --------------------------------------------------------------------------
  // UPDATE PASSWORD
  // --------------------------------------------------------------------------
  if (url.pathname === "/api/user/update-password" && method === "POST") {
    return (async () => {
      const { userId, oldPassword, newPassword } = await request.json();

      const user = await getUser(env, userId);
      if (!user) return json({ error: "User not found" }, 404);

      if (user.password !== oldPassword) {
        return json({ error: "Old password incorrect" }, 403);
      }

      user.password = newPassword;
      await saveUser(env, userId, user);

      return json({ ok: true });
    })();
  }

  // --------------------------------------------------------------------------
  // UPDATE AVATAR
  // --------------------------------------------------------------------------
  if (url.pathname === "/api/user/update-avatar" && method === "POST") {
    return (async () => {
      const { userId, avatarBase64 } = await request.json();
      if (!userId) return json({ error: "Missing userId" }, 400);

      const user = await getUser(env, userId);
      if (!user) return json({ error: "User not found" }, 404);

      user.profile_image = avatarBase64;

      await saveUser(env, userId, user);
      return json({ ok: true, user });
    })();
  }

  // --------------------------------------------------------------------------
  // ADD DAY
  // --------------------------------------------------------------------------
  if (url.pathname === "/api/user/add-day" && method === "POST") {
    return (async () => {
      const { id } = await request.json();
      if (!id) return json({ error: "Missing user id" }, 400);

      const user = await getUser(env, id);
      if (!user) return json({ error: "User not found" }, 404);

      user.stats.dayPurchasesLast7Days =
        (user.stats.dayPurchasesLast7Days ?? 0) + 1;

      const daily = user.stats.dayPurchasesLast7Days;
      const bonus = evaluateWeeklyBonus(daily);

      user.bonus = bonus;

      if (bonus.award) {
        user.subscription = {
          type: bonus.award,
          expiresAt: bonus.expiresAt,
        };
      }

      await saveUser(env, id, user);
      return json(user);
    })();
  }

  // --------------------------------------------------------------------------
  // APPLY BONUS (manual admin tool)
  // --------------------------------------------------------------------------
  if (url.pathname === "/api/user/apply-bonus" && method === "POST") {
    return (async () => {
      const { id, dailyCount } = await request.json();
      if (!id) return json({ error: "Missing user id" }, 400);

      const user = await getUser(env, id);
      if (!user) return json({ error: "User not found" }, 404);

      const bonus = evaluateWeeklyBonus(Number(dailyCount));
      user.bonus = bonus;

      if (bonus.award) {
        user.subscription = {
          type: bonus.award,
          expiresAt: bonus.expiresAt,
        };
      }

      user.stats.dayPurchasesLast7Days = Number(dailyCount);

      await saveUser(env, id, user);
      return json(user);
    })();
  }

  // --------------------------------------------------------------------------
  // DELETE USER (correct)
  // --------------------------------------------------------------------------
  if (url.pathname === "/api/admin/user/delete" && method === "POST") {
    return (async () => {
      const { token, id } = await request.json();
      if (token !== env.ADMIN_TOKEN)
        return json({ error: "Forbidden" }, 403);

      return await deleteUser(env, id);
    })();
  }

  // --------------------------------------------------------------------------
  // NO MATCH → let api.js continue
  // --------------------------------------------------------------------------
  return null;
}
