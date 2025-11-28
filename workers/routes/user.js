import { json } from "../core/json.js";
import { getUser, saveUser, findUserByEmail } from "../services/user.js";
import { createSession, verifySession, deleteSession } from "../services/session.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

export async function userRoutes(url, method, request, env) {

  // LOGIN
  if (url.pathname === "/api/user/login" && method === "POST") {
    const { email, password } = await request.json();
    const user = await findUserByEmail(env, email);
    if (!user) return json({ ok: false, error: "EMAIL_NOT_FOUND" }, 404);

    const ok = await verifyPassword(password, user.password_hash, user.password_salt);
    if (!ok) return json({ ok: false, error: "WRONG_PASSWORD" }, 401);

    const session = await createSession(env, user.id, "user");
    return json({ ok: true, sessionId: session.sessionId });
  }

  // REGISTER
  if (url.pathname.replace(/\/+$/, "") === "/api/user/register" && method === "POST")
    {
    const { email, password, firstname, lastname } = await request.json();

    const exists = await findUserByEmail(env, email);
    if (exists) return json({ ok: false, error: "EMAIL_EXISTS" }, 409);

    const id = crypto.randomUUID();
    const { hash, salt } = await hashPassword(password);

    const user = {
      id,
      email,
      firstname,
      lastname,
      mailing: { primary: email },
      password_hash: hash,
      password_salt: salt,
      status: { suspended: false, createdAt: Date.now() },
      stats: {},
    };

    await saveUser(env, id, user);
    return json({ ok: true });
  }

  // GET USER
  if (url.pathname === "/api/user/get" && method === "POST") {
    const { userId } = await request.json();
    const user = await getUser(env, userId);
    if (!user) return json({ ok: false, error: "USER_NOT_FOUND" }, 404);
    return json({ ok: true, user });
  }

  // UPDATE PROFILE
  if (url.pathname === "/api/user/update-profile" && method === "POST") {
    const { userId, data } = await request.json();

    const user = await getUser(env, userId);
    if (!user) return json({ ok: false, error: "USER_NOT_FOUND" }, 404);

    Object.assign(user, data);
    await saveUser(env, userId, user);
    return json({ ok: true, user });
  }

  // UPDATE PASSWORD
  if (url.pathname === "/api/user/update-password" && method === "POST") {
    const { userId, oldPassword, newPassword } = await request.json();

    const user = await getUser(env, userId);
    if (!user) return json({ ok: false, error: "USER_NOT_FOUND" }, 404);

    const ok = await verifyPassword(oldPassword, user.password_hash, user.password_salt);
    if (!ok) return json({ ok: false, error: "WRONG_OLD_PASSWORD" }, 403);

    const { hash, salt } = await hashPassword(newPassword);
    user.password_hash = hash;
    user.password_salt = salt;

    await saveUser(env, userId, user);
    return json({ ok: true });
  }

  // DELETE ACCOUNT
  if (url.pathname === "/api/user/delete-account" && method === "POST") {
    const { userId } = await request.json();
    await env.AGW_USERS.delete(`user:${userId}`);
    return json({ ok: true });
  }

  // UPDATE EMAIL PREFS
  if (url.pathname === "/api/user/update-email-prefs" && method === "POST") {
    const { userId, prefs } = await request.json();

    const user = await getUser(env, userId);
    if (!user) return json({ ok: false, error: "USER_NOT_FOUND" }, 404);

    user.mailing = user.mailing || {};
    user.mailing.preferences = { ...(user.mailing.preferences || {}), ...prefs };

    await saveUser(env, userId, user);
    return json({ ok: true, user });
  }

  // UPDATE AVATAR
  if (url.pathname === "/api/user/update-avatar" && method === "POST") {
    const { userId, avatarBase64 } = await request.json();

    const user = await getUser(env, userId);
    if (!user) return json({ ok: false, error: "USER_NOT_FOUND" }, 404);

    user.profile_image = avatarBase64;

    await saveUser(env, userId, user);
    return json({ ok: true, user });
  }

  // REQUEST PASSWORD RESET
  if (url.pathname === "/api/user/request-reset" && method === "POST") {
    const { email } = await request.json();

    const user = await findUserByEmail(env, email);
    if (!user) return json({ ok: true }); // non rivelare

    const token = crypto.randomUUID();
    user.resetToken = token;
    user.resetTokenExp = Date.now() + 1000 * 60 * 10; // 10 min

    await saveUser(env, user.id, user);
    return json({ ok: true, token });
  }

  // DO RESET
  if (url.pathname === "/api/user/do-reset" && method === "POST") {
    const { token, newPassword } = await request.json();

    const { keys } = await env.AGW_USERS.list({ prefix: "user:" });

    for (const k of keys) {
      const raw = await env.AGW_USERS.get(k.name);
      if (!raw) continue;

      const user = JSON.parse(raw);

      if (user.resetToken === token && Date.now() < user.resetTokenExp) {
        const { hash, salt } = await hashPassword(newPassword);
        user.password_hash = hash;
        user.password_salt = salt;

        delete user.resetToken;
        delete user.resetTokenExp;

        await saveUser(env, user.id, user);
        return json({ ok: true });
      }
    }

    return json({ ok: false, error: "INVALID_OR_EXPIRED_TOKEN" }, 400);
  }

  // LOGOUT
  if (url.pathname === "/api/user/logout" && method === "POST") {
    const { sessionId } = await request.json();
    await deleteSession(env, sessionId);
    return json({ ok: true });
  }

  // CHANGE PASSWORD
  if (url.pathname === "/api/user/change-password" && method === "POST") {
    const { userId, oldPassword, newPassword } = await request.json();

    const user = await getUser(env, userId);
    if (!user) return json({ ok: false, error: "USER_NOT_FOUND" });

    const ok = await verifyPassword(oldPassword, user.password_hash, user.password_salt);
    if (!ok) return json({ ok: false, error: "WRONG_OLD_PASSWORD" }, 403);

    const { hash, salt } = await hashPassword(newPassword);
    user.password_hash = hash;
    user.password_salt = salt;

    await saveUser(env, userId, user);
    return json({ ok: true });
  }

  return null;
}
