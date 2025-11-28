import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const backendRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    }
  );

  const data = await backendRes.json();

  if (!backendRes.ok || !data.ok) {
    return NextResponse.json(
      { error: data.error || "INVALID_CREDENTIALS" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });

  // Imposta cookie admin
  res.cookies.set("agw_admin_session", data.admin.id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}
