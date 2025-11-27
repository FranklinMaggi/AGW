import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
  const res = await fetch(`${apiUrl}/api/user/request-password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  const data = await res.json();

  return NextResponse.json(data);
}
