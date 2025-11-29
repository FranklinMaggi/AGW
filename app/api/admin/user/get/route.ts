import { NextResponse } from "next/server";
import { proxyAdmin } from "../../_utils";
export async function POST(req: Request) {
  const { id } = await req.json();

  const result = await proxyAdmin("/api/admin/users/list", {}, "GET");

  if (!result.ok) {
    return NextResponse.json(result.json, { status: result.status });
  }

  const user = result.json.users.find((u: any) => u.id === id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
