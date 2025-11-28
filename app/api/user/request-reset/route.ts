import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  const backend = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user/request-reset`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }
  );

  return NextResponse.json(await backend.json(), {
    status: backend.status,
  });
}
