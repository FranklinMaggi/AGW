import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const backend = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await backend.json();
  return NextResponse.json(data, { status: backend.status });
}
