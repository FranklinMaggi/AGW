import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const backend = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backend.json();

  if (!backend.ok) {
    return NextResponse.json(data, { status: backend.status });
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set("agw_admin_session", data.sessionId, {
    httpOnly: true,
   secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res;
}
