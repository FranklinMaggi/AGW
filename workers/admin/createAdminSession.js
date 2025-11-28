export async function createAdminSession(env, adminId) {
    const sessionId = crypto.randomUUID();
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24h
  
    const payload = {
      adminId,
      createdAt: Date.now(),
      expiresAt
    };
  
    await env.AGW_ADMIN_SESSIONS.put(`session:${sessionId}`, JSON.stringify(payload));
  
    return sessionId;
  }
  