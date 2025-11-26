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
    return {
      ok: false,
      status: 404,
      error: "User not found"
    };
  }

  if (user.password !== password) {
    return {
      ok: false,
      status: 401,
      error: "Invalid password"
    };
  }

  if (user.status?.suspended) {
    return {
      ok: false,
      status: 403,
      error: "Account suspended"
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
