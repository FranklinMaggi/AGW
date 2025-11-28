// Unified session system

export async function createSession(env, userId, role = "user") {
    const sessionId = crypto.randomUUID();
    const session = {
      sessionId,
      userId,
      role,
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
    };
  
    await env.AGW_SESSIONS.put(`sess:${sessionId}`, JSON.stringify(session));
    return session;
  }
  
  export async function verifySession(env, sessionId) {
    if (!sessionId) return null;
    const raw = await env.AGW_SESSIONS.get(`sess:${sessionId}`);
    if (!raw) return null;
  
    const session = JSON.parse(raw);
  
    if (session.expiresAt < Date.now()) {
      await env.AGW_SESSIONS.delete(`sess:${sessionId}`);
      return null;
    }
  
    return session;
  }
  
  export async function deleteSession(env, sessionId) {
    await env.AGW_SESSIONS.delete(`sess:${sessionId}`);
  }
  