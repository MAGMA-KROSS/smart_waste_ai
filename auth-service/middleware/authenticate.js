/**
 * auth-service/middleware/authenticate.js
 *
 * Authentication and Authorization middleware for Next.js API routes.
 *
 * Usage in any API route:
 *   const { user, error: authError } = await authenticateUser(request);
 *   if (authError) return authError; // returns NextResponse 401
 *
 *   const authzError = authorizeRoles("admin")(user);
 *   if (authzError) return authzError; // returns NextResponse 403
 *
 * Reads the JWT from the HttpOnly cookie "swai_token".
 * The role is extracted from the JWT (set at login time from MongoDB).
 */

import { NextResponse } from "next/server.js";
import { jwtVerify } from "jose";

const DEFAULT_SECRET = "smart_waste_ai_jwt_secret_key_development_2026_secure_token";

function getSecret() {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

/**
 * Verifies the JWT cookie and returns the authenticated user.
 * Returns { user, error } where error is a NextResponse (401) if auth fails.
 *
 * @param {Request} request - Next.js API route request
 * @returns {Promise<{ user: {id: string, role: string} | null, error: NextResponse | null }>}
 */
export async function authenticateUser(request) {
  const token = request.cookies.get("swai_token")?.value;

  if (!token) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Authentication required. Please login." },
        { status: 401 }
      ),
    };
  }

  try {
    const payload = await jwtVerify(token, getSecret());
    return {
      user: {
        id: payload.payload.userId,
        role: payload.payload.role,
      },
      error: null,
    };
  } catch {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Invalid or expired session. Please login again." },
        { status: 401 }
      ),
    };
  }
}

/**
 * Returns a function that checks if the authenticated user has an allowed role.
 * Returns NextResponse (403) if role not permitted, null if allowed.
 *
 * @param {...string} allowedRoles - e.g. "admin", "worker", "citizen"
 * @returns {function(user): NextResponse | null}
 */
export function authorizeRoles(...allowedRoles) {
  return function (user) {
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        {
          error: `Access forbidden. Required role(s): ${allowedRoles.join(", ")}. Your role: ${user.role}`,
        },
        { status: 403 }
      );
    }
    return null; // authorized — continue
  };
}
