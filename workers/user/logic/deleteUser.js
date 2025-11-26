// workers/user/logic/deleteUser.js

import { json } from "../../core/response.js";

export async function deleteUser(env, id) {
  if (!id) return json({ error: "Missing id" }, 400);

  await env.AGW_USERS.delete(`user:${id}`);

  return json({ deleted: true });
}
