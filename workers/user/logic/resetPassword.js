import { getUser } from "../repo/getUser.js";
import { saveUser } from "../repo/saveUser.js";

export async function resetPassword(env, token, newPassword) {
  const { keys } = await env.AGW_USERS.list({ prefix: "user:" });

  let targetUser = null;

  for (const k of keys) {
    if (k.name === "user:index") continue;

    const raw = await env.AGW_USERS.get(k.name);
    if (!raw) continue;

    let u;
    try { u = JSON.parse(raw); } catch { continue; }

    if (u.password_reset?.token === token) {
      targetUser = u;
      break;
    }
  }

  if (!targetUser) {
    return { ok: false, error: "Invalid token", status: 400 };
  }

  if (targetUser.password_reset.expires_at < Date.now()) {
    return { ok: false, error: "Token expired", status: 400 };
  }

  // Reset password
  targetUser.password = newPassword;

  // Remove token  
  targetUser.password_reset = {
    token: null,
    expires_at: null
  };

  await saveUser(env, targetUser.id, targetUser);

  return { ok: true };
}
