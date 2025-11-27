import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // Invalida sessione
  cookieStore.set("agw_session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  // Next.js 16 → Redirect ASSOLUTO obbligatorio
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUrl = `${baseUrl}/login`;

  return NextResponse.redirect(redirectUrl, {
    status: 302,
  });
}
