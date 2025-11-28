export async function verifyAdminSession(env, sessionId) {
    const raw = await env.AGW_ADMIN_SESSIONS.get(`session:${sessionId}`);
    if (!raw) return null;
  
    const session = JSON.parse(raw);
  
    if (session.expiresAt < Date.now()) {
      await env.AGW_ADMIN_SESSIONS.delete(`session:${sessionId}`);
      return null;
    }
  
    return session;
  }
  