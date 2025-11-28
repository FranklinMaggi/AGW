import { getAdmin } from "./getAdmin.js";
import { createAdminSession } from "./createAdminSession.js";

export async function loginAdmin(env, email, password) {
  const admin = await getAdmin(env, email);
  if (!admin) {
    return { ok: false, error: "ADMIN_NOT_FOUND", status: 404 };
  }

  // Password plaintext (per ora) → DA HASHARE
  if (admin.password !== password) {
    return { ok: false, error: "WRONG_PASSWORD", status: 401 };
  }

  const sessionId = await createAdminSession(env, admin.id);

  return { ok: true, sessionId, admin };
}
