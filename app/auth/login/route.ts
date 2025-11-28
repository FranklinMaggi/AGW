import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    // Email non esiste
    if (backendRes.status === 404) {
      return NextResponse.json(
        { error: "EMAIL_NOT_FOUND" },
        { status: 404 }
      );
    }

    let data;
try {
  data = await backendRes.json();
} catch {
  return NextResponse.json(
    { error: "INTERNAL_BACKEND_ERROR" },
    { status: 500 }
  );
}

    // Password errata
    if (!data.ok) {
      return NextResponse.json(
        { error: "WRONG_PASSWORD" },
        { status: 401 }
      );
    }

    // LOGIN OK → Imposta cookie di sessione
    const res = NextResponse.json({ ok: true, user: data.user });

    res.cookies.set("agw_session", data.user.id, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/"
    });

    return res;

  } catch (err: any) {
    return NextResponse.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
