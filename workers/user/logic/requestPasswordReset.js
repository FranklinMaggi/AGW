import { findUserByEmail } from "../repo/findUserByEmail.js";
import { saveUser } from "../repo/saveUser.js";

export async function requestPasswordReset(env, email) {
  const user = await findUserByEmail(env, email);

  // Sicurezza: ritorniamo sempre ok anche se user non esiste
  if (!user) {
    return { ok: true };
  }

  const token = crypto.randomUUID();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minuti

  user.password_reset = {
    token,
    expires_at: expiresAt
  };

  await saveUser(env, user.id, user);

  return {
    ok: true,
    reset_token: token  // solo per dev, da togliere in prod
  };
}
