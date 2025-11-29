import { NextResponse } from "next/server";
import { proxyAdmin } from "../../_utils";

export async function POST() {
  const id = crypto.randomUUID();

  const result = await proxyAdmin("/api/admin/user/update", {
    id,
    field: "create",
    value: {}
  });

  if (!result.ok) {
    return NextResponse.json(result.json, { status: result.status });
  }

  return NextResponse.json({ ok: true, id });
}
