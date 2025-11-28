import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("agw_session")?.value;

  if (!userId)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const backend = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user/delete-account`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }
  );

  return NextResponse.json(await backend.json(), {
    status: backend.status,
  });
}
