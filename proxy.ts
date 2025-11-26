import { NextResponse, NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("agw_session")?.value;

  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
