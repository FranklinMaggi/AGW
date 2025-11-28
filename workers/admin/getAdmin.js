export async function getAdmin(env, email) {
    const { keys } = await env.AGW_ADMIN.list({ prefix: "admin:" });
  
    for (const k of keys) {
      const raw = await env.AGW_ADMIN.get(k.name);
      if (!raw) continue;
  
      const admin = JSON.parse(raw);
      if (admin.email.toLowerCase() === email.toLowerCase()) {
        return admin;
      }
    }
  
    return null;
  }
  