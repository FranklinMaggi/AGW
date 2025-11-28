import { hashPassword, verifyPassword } from "../utils/password.js";

/**
 * Normalizza l'email per ricerca e matching
 */
function normalize(value) {
  return (value || "").trim().toLowerCase();
}

/**
 * Recupera un admin tramite email
 * (BFF usa solo email + password)
 */
export async function getAdmin(env, email) {
  const target = normalize(email);

  const { keys } = await env.AGW_ADMIN.list({ prefix: "admin:" });

  for (const k of keys) {
    if (!k.name.startsWith("admin:")) continue;

    const raw = await env.AGW_ADMIN.get(k.name);
    if (!raw) continue;

    let admin;
    try {
      admin = JSON.parse(raw);
    } catch {
      continue;
    }

    if (normalize(admin.email) === target) {
      return admin;
    }
  }

  return null;
}

/**
 * Salva/aggiorna un admin in KV
 */
export async function saveAdmin(env, id, admin) {
  await env.AGW_ADMIN.put(`admin:${id}`, JSON.stringify(admin));
}

/**
 * Crea un nuovo admin
 * (serve in onboarding del sistema)
 */
export async function createAdmin(env, email, password) {
  const id = crypto.randomUUID();
  const normEmail = normalize(email);

  const { hash, salt } = await hashPassword(password);

  const admin = {
    id,
    email: normEmail,
    password_hash: hash,
    password_salt: salt,
    role: "admin",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await saveAdmin(env, id, admin);

  return admin;
}

/**
 * Verifica login admin → ritorna admin se password corretta
 */
export async function authenticateAdmin(env, email, password) {
  const admin = await getAdmin(env, email);
  if (!admin) return null;

  const ok = await verifyPassword(password, admin.password_hash, admin.password_salt);
  if (!ok) return null;

  return admin;
}
