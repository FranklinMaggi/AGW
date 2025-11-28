import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("agw_admin_session")?.value;

  // invalida sessione nel backend
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId })
  });

  // elimina cookie
  cookieStore.set("agw_admin_session", "", {
    httpOnly: true,
    secure: true,
    path: "/",
    expires: new Date(0),
  });

  return NextResponse.redirect("/admin/login");
}
