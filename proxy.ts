import { NextResponse, NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const userSession = request.cookies.get("agw_session")?.value;
  const adminSession = request.cookies.get("agw_admin_session")?.value;

  // Protect /dashboard/*
  if (url.pathname.startsWith("/dashboard")) {
    if (!userSession) {
      const redirect = url.clone();
      redirect.pathname = "/login";
      return NextResponse.redirect(redirect);
    }
  }

  // Protect /admin/*
  if (url.pathname.startsWith("/admin")) {
    // Allow /admin/login
    if (url.pathname.startsWith("/admin/login")) {
      return NextResponse.next();
    }

    if (!adminSession) {
      const redirect = url.clone();
      redirect.pathname = "/admin/login";
      return NextResponse.redirect(redirect);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*"
  ],
};
