export async function getSession(env, sessionId) {
    const raw = await env.AGW_SESSIONS.get(`sess:${sessionId}`);
    return raw ? JSON.parse(raw) : null;
  }
  