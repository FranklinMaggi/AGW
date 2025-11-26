export async function findUserByEmail(env, email) {
    const { keys } = await env.AGW_USERS.list({ prefix: "user:" });
  
    for (const k of keys) {
      if (k.name === "user:index") continue;
  
      const raw = await env.AGW_USERS.get(k.name);
      if (!raw) continue;
  
      const user = JSON.parse(raw);
      if (user.email === email) return user;
    }
  
    return null;
  }
  