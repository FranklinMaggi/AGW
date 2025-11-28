import { findUserByEmail } from "../repo/findUserByEmail.js";
import { verifyPassword } from "../../security/verifyPassword.js";
import { createSession } from "../../sessions/createSession.js";
import { json } from "../../core/response.js";

export async function loginUser(env, body) {
  const { email, password } = body;

  if (!email || !password)
    return json({ ok: false, error: "Missing credentials" }, 400);

  const user = await findUserByEmail(env, email);
  if (!user)
    return json({ ok: false, error: "EMAIL_NOT_FOUND" }, 404);

  const match = await verifyPassword(password, user.password_hash, user.password_salt);
  if (!match)
    return json({ ok: false, error: "WRONG_PASSWORD" }, 401);

  if (user.status?.suspended)
    return json({ ok: false, error: "ACCOUNT_SUSPENDED" }, 403);

  const sessionId = await createSession(env, user.id, "user");

  return json({
    ok: true,
    sessionId,
    user: {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname
    }
  });
}
