export async function getUser(env, id) {
    const raw = await env.AGW_USERS.get(`user:${id}`);
    return raw ? JSON.parse(raw) : null;
  }
  