export async function saveUser(env, id, user) {
    await env.AGW_USERS.put(`user:${id}`, JSON.stringify(user));
  }
  
  export async function getUser(env, id) {
    const raw = await env.AGW_USERS.get(`user:${id}`);
    return raw ? JSON.parse(raw) : null;
  }
  
  export async function findUserByEmail(env, email) {
    const norm = (v) => (v || "").trim().toLowerCase();
    const target = norm(email);
    if (!target) return null;
  
    const { keys } = await env.AGW_USERS.list({ prefix: "user:" });
  
    for (const k of keys) {
      if (k.name === "user:index") continue;
      const raw = await env.AGW_USERS.get(k.name);
      if (!raw) continue;
  
      let user;
      try {
        user = JSON.parse(raw);
      } catch {
        continue;
      }
  
      if (norm(user.email) === target || norm(user.mailing?.primary) === target) {
        return user;
      }
    }
  
    return null;
  }
  