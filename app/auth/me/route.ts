import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("agw_session")?.value;

  if (!session) {
    return NextResponse.json({ ok: false });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user/get`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: session })
    }
  );

  if (!res.ok) {
    return NextResponse.json({ ok: false });
  }

  const user = await res.json();

  return NextResponse.json({ ok: true, user });
}
