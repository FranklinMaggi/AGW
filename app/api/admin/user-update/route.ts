import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("agw_admin_session")?.value;

  if (!sessionId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();

  const backend = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/user/update`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, ...body }),
    }
  );

  const data = await backend.json();

  return NextResponse.json(data, { status: backend.status });
}
