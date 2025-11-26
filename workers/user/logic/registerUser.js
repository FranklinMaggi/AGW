import { json } from "../../core/response.js";
import { saveUser } from "../repo/saveUser.js";
import { getUser } from "../repo/getUser.js";
import { createDefaultUser } from "../model/defaultUser.js";

// Utility per cercare user via email (parte del repo)
import { findUserByEmail } from "../repo/findUserByEmail.js";

export async function registerUserHandler(request, env) {
  const body = await request.json();
  const { email, firstname, lastname, password } = body;

  // Validazioni minime
  if (!email) return json({ error: "Missing email" }, 400);
  if (!password) return json({ error: "Missing password" }, 400);

  // Check utente già esistente
  const existing = await findUserByEmail(env, email);
  if (existing) return json({ error: "Email already registered" }, 409);

  // Create user
  const id = crypto.randomUUID();
  const user = createDefaultUser(id);

  // Assegna campi base
  user.email = email;
  user.mailing.primary = email;
  user.firstname = firstname || "";
  user.lastname = lastname || "";
  user.password = password;   // (da hashare in futuro)

  // Salvataggio
  await saveUser(env, id, user);

  return json({ ok: true, user });
}
