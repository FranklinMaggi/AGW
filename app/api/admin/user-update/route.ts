import { NextResponse } from "next/server";
import { proxyAdmin } from "../../admin/_utils";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await proxyAdmin("/api/admin/user/update", body);

  return NextResponse.json(result.json, { status: result.status });
}
