import { NextResponse } from "next/server";
import { proxyAdmin } from "../_utils";

export async function POST() {
  const result = await proxyAdmin("/api/admin/me");

  return NextResponse.json(result.json, { status: result.status });
}
