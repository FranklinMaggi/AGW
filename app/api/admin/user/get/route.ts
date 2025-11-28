import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("agw_admin_session")?.value;

  if (!sessionId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await req.json();

  const backend = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/list`,
    { method: "GET" }
  );

  const data = await backend.json();

  if (!data.ok) return NextResponse.json(data, { status: backend.status });

  const user = data.users.find((u: any) => u.id === id);

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(user);
}
