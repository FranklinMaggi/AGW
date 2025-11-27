import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { oldPassword, newPassword } = await req.json();


  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // FIX Next.js 16 (cookies async)
  const cookieStore = await cookies();
  const userId = cookieStore.get("agw_session")?.value;

  if (!userId) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL + "/api/user/update-password";

  const backendRes = await fetch(backendUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      oldPassword,
      newPassword,
    }),
  });

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  return NextResponse.json({ ok: true });
}
