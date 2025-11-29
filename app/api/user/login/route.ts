import { NextResponse } from "next/server";

interface LoginResponse {
  ok: boolean;
  sessionId?: string;
  error?: string;
}

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // CHIAMATA AL BACKEND WORKER
  const backend = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }
  );

  let data: LoginResponse;

  try {
    data = await backend.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_BACKEND_RESPONSE" },
      { status: 500 }
    );
  }

  // ERRORE LOGIN LATO WORKER
  if (!backend.ok) {
    return NextResponse.json(data, { status: backend.status });
  }

  // LOGIN OK → sessionId deve esistere
  if (!data.sessionId) {
    return NextResponse.json(
      { ok: false, error: "MISSING_SESSION_ID" },
      { status: 500 }
    );
  }

  const isProd = process.env.NODE_ENV === "production";

  const res = NextResponse.json({ ok: true });

  res.cookies.set("agw_session", data.sessionId, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    path: "/",
  });

  return res;
}
