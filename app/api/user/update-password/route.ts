import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("agw_session")?.value;

  if (!userId)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();

  const backend = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user/update-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...body }),
    }
  );

  return NextResponse.json(await backend.json(), {
    status: backend.status,
  });
}
