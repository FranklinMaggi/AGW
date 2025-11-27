import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("agw_session")?.value;

    if (!userId)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();

    const backend = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/update-profile`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, data: body }),
      }
    );

    const data = await backend.json();
    return NextResponse.json(data, { status: backend.status });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
