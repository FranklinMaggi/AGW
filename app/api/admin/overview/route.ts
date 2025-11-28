import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("agw_admin_session")?.value;

  if (!sessionId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const backend = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/overview`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }
  );

  const data = await backend.json();

  return NextResponse.json(data, { status: backend.status });
}
