import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const backend = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }
  );

  const data = await backend.json();

  if (!backend.ok) {
    return NextResponse.json(data, { status: backend.status });
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set("agw_session", data.sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}
