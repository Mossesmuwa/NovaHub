// ======================================================
// FILE: apps/admin/middleware.js
// PURPOSE:
// Protect admin routes from unauthenticated access.
//
// NOTE:
// Runs BEFORE page loads (server-level protection)
// ======================================================

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoginPage = req.nextUrl.pathname.startsWith("/account/login");

  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  // Allow login page always
  if (isLoginPage) return NextResponse.next();

  // Protect admin dashboard
  if (isDashboard && !token) {
    return NextResponse.redirect(new URL("/account/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
