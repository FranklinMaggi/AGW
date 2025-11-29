import { cookies } from "next/headers";

export async function proxyAdmin(path: string, payload?: any, method: "GET" | "POST" = "POST") {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("agw_admin_session")?.value;

  if (!sessionId) {
    return {
      ok: false,
      status: 403,
      json: { error: "UNAUTHORIZED" }
    };
  }

  const backendBase = process.env.NEXT_PUBLIC_API_URL;

  // GET: sessionId in querystring
  let url = `${backendBase}${path}`;
  if (method === "GET") {
    const qs = `?sessionId=${sessionId}`;
    url = url.includes("?") ? `${url}&sessionId=${sessionId}` : `${url}${qs}`;
  }

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: method === "POST" ? JSON.stringify({ sessionId, ...(payload || {}) }) : undefined
  });

  return {
    ok: res.ok,
    status: res.status,
    json: await res.json()
  };
}
