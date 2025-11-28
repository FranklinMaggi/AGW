export async function createSession(env, userId, role = "user") {
    const sessionId = crypto.randomUUID();
  
    const data = {
      userId,
      role,
      createdAt: Date.now(),
    };
  
    // TTL: 30 giorni
    await env.AGW_SESSIONS.put(`sess:${sessionId}`, JSON.stringify(data), {
      expirationTtl: 60 * 60 * 24 * 30
    });
  
    return sessionId;
  }
  