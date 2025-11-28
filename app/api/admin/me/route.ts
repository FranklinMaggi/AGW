import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("agw_admin_session")?.value;

  if (!sessionId)
    return NextResponse.json({ ok: false });

  const backend = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/me`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }
  );

  return NextResponse.json(await backend.json());
}
