import { createDefaultUser } from "./defaultUser.js";
import { deepMerge } from "../../core/deepMerge.js";

export function normalizeUserProfile(u) {
  const base = createDefaultUser(u.id || "unknown");

  const merged = deepMerge(base, u);

  // Assicura compatibilità versioni precedenti
  if (!merged.password_reset) {
    merged.password_reset = {
      token: null,
      expires_at: null
    };
  }

  return merged;
}
