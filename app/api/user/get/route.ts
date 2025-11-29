import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("agw_session")?.value;

  if (!sessionId)
    return NextResponse.json(
      { ok: false, error: "NOT_AUTH" },
      { status: 401 }
    );

  const backend = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user/get`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),   // ✔ OBBLIGATORIO
      cache: "no-store",
    }
  );

  const data = await backend.json();

  return NextResponse.json(data, { status: backend.status });
}
