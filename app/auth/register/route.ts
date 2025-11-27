import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, firstname, lastname, password } = await req.json();

  if (!email || !firstname || !lastname || !password) {
    return NextResponse.json(
      { ok: false, error: "Missing fields" },
      { status: 400 }
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const backendRes = await fetch(`${apiUrl}/api/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, firstname, lastname, password }),
  });

  const data = await backendRes.json();

  if (data.error) {
    return NextResponse.json(
      { ok: false, error: data.error },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, user: data.user });
}
