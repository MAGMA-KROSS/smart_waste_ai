/**
 * src/middleware.js
 * Edge Middleware for frontend route protection using jose.
 */

import { NextResponse } from "next/server.js";
import { jwtVerify } from "jose";

const DEFAULT_SECRET = "smart_waste_ai_jwt_secret_key_development_2026_secure_token";

function getSecret() {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

const ROUTE_RULES = [
  {
    pattern: "/citizen/dashboard",
    allowedRoles: ["citizen", "worker", "admin"],
    loginRedirect: "/citizen/login",
  },
  {
    pattern: "/citizen/scan-waste",
    allowedRoles: ["citizen", "worker", "admin"],
    loginRedirect: "/citizen/login",
  },
  {
    pattern: "/scan-waste",
    allowedRoles: ["citizen", "worker", "admin"],
    loginRedirect: "/citizen/login",
  },
  {
    pattern: "/worker",
    allowedRoles: ["worker", "admin"],
    loginRedirect: "/citizen/login",
    wrongRoleRedirect: "/citizen/dashboard",
  },
  {
    pattern: "/admin",
    allowedRoles: ["admin"],
    loginRedirect: "/citizen/login",
    wrongRoleRedirect: "/citizen/dashboard",
  },
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const rule = ROUTE_RULES.find((r) => pathname.startsWith(r.pattern));
  if (!rule) return NextResponse.next();

  const token = request.cookies.get("swai_token")?.value;
  const secret = getSecret();

  if (!token || !secret) {
    const loginUrl = new URL(rule.loginRedirect || "/citizen/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role;

    if (!rule.allowedRoles.includes(role)) {
      const redirectUrl = new URL(
        rule.wrongRoleRedirect || getDashboardForRole(role),
        request.url
      );
      return NextResponse.redirect(redirectUrl);
    }

    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.userId || "");
    response.headers.set("x-user-role", role || "");
    return response;
  } catch {
    const loginUrl = new URL(rule.loginRedirect || "/citizen/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set("swai_token", "", { maxAge: 0, path: "/" });
    return response;
  }
}

function getDashboardForRole(role) {
  if (role === "admin") return "/admin";
  if (role === "worker") return "/worker";
  return "/citizen/dashboard";
}

export const config = {
  matcher: [
    "/citizen/dashboard/:path*",
    "/citizen/scan-waste/:path*",
    "/scan-waste/:path*",
    "/worker/:path*",
    "/admin/:path*",
  ],
};
