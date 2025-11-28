export async function deleteSession(env, sessionId) {
    await env.AGW_SESSIONS.delete(`sess:${sessionId}`);
  }
  