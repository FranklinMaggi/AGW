export async function saveUser(env, id, user) {
  await env.AGW_USERS.put(`user:${id}`, JSON.stringify(user));
}
