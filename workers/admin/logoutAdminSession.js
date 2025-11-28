export async function logoutAdmin(env, sessionId) {
    await env.AGW_ADMIN_SESSIONS.delete(`session:${sessionId}`);
    return true;
  }
  