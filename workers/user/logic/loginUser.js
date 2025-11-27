import { findUserByEmail } from "../repo/findUserByEmail.js";
import { normalizeUserProfile } from "../model/normalizeUser.js";

export async function loginUser(env, body) {
  const { email, password } = body;

  if (!email || !password) {
    return {
      ok: false,
      status: 400,
      error: "Missing email or password"
    };
  }

  const user = await findUserByEmail(env, email);

  if (!user) {
    // 404 → Next /auth/login lo traduce in EMAIL_NOT_FOUND
    return {
      ok: false,
      status: 404,
      error: "EMAIL_NOT_FOUND"
    };
  }

  if (user.password !== password) {
    // 401 → Next /auth/login lo traduce in WRONG_PASSWORD
    return {
      ok: false,
      status: 401,
      error: "WRONG_PASSWORD"
    };
  }

  if (user.status?.suspended) {
    return {
      ok: false,
      status: 403,
      error: "ACCOUNT_SUSPENDED"
    };
  }

  const safeUser = normalizeUserProfile(user);
  delete safeUser.password;

  return {
    ok: true,
    status: 200,
    user: safeUser
  };
}
